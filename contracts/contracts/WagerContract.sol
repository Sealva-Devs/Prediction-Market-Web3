// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// WagerContract - handles peer-to-peer wagering with multi-sig escrow
contract WagerContract is ReentrancyGuard, Ownable {
    enum WagerStatus {
        CREATED,
        PENDING,
        ACTIVE,
        RESOLVED,
        CANCELLED
    }

    struct Participant {
        address participant;
        uint256 pledgedAmount;
        bool hasSigned;
        uint256 pledgedAt;
    }

    struct Wager {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 minPledge;
        uint256 totalPledged;
        uint256 deadline;
        uint256 createdAt;
        WagerStatus status;
        address winner;
        uint256 resolvedAt;
        bool isPublic;
        uint256 multiSigDeadlineHours;
        uint256 multiSigDeadline;
        string marketId; // Polymarket market ID if linked
        Participant[] participants;
        mapping(address => bool) hasParticipated;
        mapping(address => bool) signatures;
    }

    uint256 public wagerCounter;
    mapping(uint256 => Wager) public wagers;
    mapping(address => uint256[]) public userWagers; // tracks which wagers each user is in

    // Events
    event WagerCreated(
        uint256 indexed wagerId,
        address indexed creator,
        string title,
        uint256 minPledge,
        uint256 deadline,
        bool isPublic
    );

    event Pledged(
        uint256 indexed wagerId,
        address indexed participant,
        uint256 amount
    );

    event WagerResolved(
        uint256 indexed wagerId,
        address indexed winner,
        uint256 totalPayout
    );

    event SignatureAdded(
        uint256 indexed wagerId,
        address indexed signer
    );

    event FundsReleased(
        uint256 indexed wagerId,
        address indexed recipient,
        uint256 amount
    );

    event WagerCancelled(uint256 indexed wagerId);

    constructor() Ownable(msg.sender) {}

    /// @notice Creates a new wager. Returns the wager ID.
    /// @param title The title of the wager
    /// @param description Detailed description of the wager
    /// @param minPledge Minimum amount required to participate (in wei)
    /// @param deadline Unix timestamp when the wager deadline expires
    /// @param multiSigDeadlineHours Hours after resolution for multi-sig signing deadline
    /// @param isPublic Whether the wager is publicly visible
    /// @param marketId Optional Polymarket market ID for dispute resolution
    /// @return wagerId The ID of the newly created wager
    function createWager(
        string memory title,
        string memory description,
        uint256 minPledge,
        uint256 deadline,
        uint256 multiSigDeadlineHours,
        bool isPublic,
        string memory marketId
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(minPledge > 0, "Min pledge must be > 0");
        require(deadline > block.timestamp, "Deadline must be in future");
        require(multiSigDeadlineHours > 0, "Multi-sig deadline required");

        uint256 wagerId = ++wagerCounter;
        Wager storage wager = wagers[wagerId];

        wager.id = wagerId;
        wager.title = title;
        wager.description = description;
        wager.creator = msg.sender;
        wager.minPledge = minPledge;
        wager.deadline = deadline;
        wager.createdAt = block.timestamp;
        wager.status = WagerStatus.CREATED;
        wager.isPublic = isPublic;
        wager.multiSigDeadlineHours = multiSigDeadlineHours;
        wager.marketId = marketId;

        // Note: userWagers is updated in pledge() when creator pledges
        // This prevents duplicate entries if creator creates and then pledges

        emit WagerCreated(
            wagerId,
            msg.sender,
            title,
            minPledge,
            deadline,
            isPublic
        );

        return wagerId;
    }

    /// @notice Pledge funds to a wager. Creator must pledge first.
    /// @param wagerId The ID of the wager to pledge to
    /// @dev The creator must be the first to pledge. Subsequent participants can pledge any amount >= minPledge.
    function pledge(uint256 wagerId) external payable nonReentrant {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");
        require(
            wager.status == WagerStatus.CREATED ||
                wager.status == WagerStatus.PENDING ||
                wager.status == WagerStatus.ACTIVE,
            "Wager not accepting pledges"
        );
        require(block.timestamp < wager.deadline, "Deadline passed");
        require(msg.value >= wager.minPledge, "Amount below minimum");
        require(
            !wager.hasParticipated[msg.sender],
            "Already pledged to this wager"
        );

        // First pledge must be from creator
        if (wager.participants.length == 0) {
            require(msg.sender == wager.creator, "Creator must pledge first");
        }

        wager.participants.push(
            Participant({
                participant: msg.sender,
                pledgedAmount: msg.value,
                hasSigned: false,
                pledgedAt: block.timestamp
            })
        );
        wager.totalPledged += msg.value;
        wager.hasParticipated[msg.sender] = true;

        // Update wager status based on participant count
        if (wager.status == WagerStatus.CREATED) {
            wager.status = WagerStatus.PENDING;
        } else if (wager.status == WagerStatus.PENDING && wager.participants.length >= 2) {
            wager.status = WagerStatus.ACTIVE;
        }

        userWagers[msg.sender].push(wagerId);

        emit Pledged(wagerId, msg.sender, msg.value);
    }

    /// @notice Resolves the wager and sets the winner. Only creator or owner can call this.
    /// @param wagerId The ID of the wager to resolve
    /// @param winner The address of the winning participant
    /// @dev Sets the wager status to RESOLVED and calculates the multi-sig deadline.
    function resolveWager(
        uint256 wagerId,
        address winner
    ) external nonReentrant {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");
        require(
            wager.status == WagerStatus.ACTIVE,
            "Wager must be active"
        );
        require(
            msg.sender == wager.creator || msg.sender == owner(),
            "Only creator or owner can resolve"
        );
        require(wager.hasParticipated[winner], "Winner must be participant");

        wager.status = WagerStatus.RESOLVED;
        wager.winner = winner;
        wager.resolvedAt = block.timestamp;
        wager.multiSigDeadline =
            block.timestamp +
            (wager.multiSigDeadlineHours * 1 hours);

        emit WagerResolved(wagerId, winner, wager.totalPledged);
    }

    /// @notice Sign the multi-sig to approve fund release. If everyone signs, funds release automatically.
    /// @param wagerId The ID of the resolved wager
    /// @dev Once all participants sign, funds are automatically released to the winner.
    function signMultiSig(uint256 wagerId) external nonReentrant {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");
        require(
            wager.status == WagerStatus.RESOLVED,
            "Wager must be resolved"
        );
        require(wager.hasParticipated[msg.sender], "Must be participant");
        require(!wager.signatures[msg.sender], "Already signed");

        wager.signatures[msg.sender] = true;

        // Mark this participant as signed
        for (uint256 i = 0; i < wager.participants.length; i++) {
            if (wager.participants[i].participant == msg.sender) {
                wager.participants[i].hasSigned = true;
                break;
            }
        }

        emit SignatureAdded(wagerId, msg.sender);

        // Check if everyone signed - if so, release funds automatically
        if (_allParticipantsSigned(wager)) {
            _releaseFunds(wagerId);
        }
    }

    /// @notice Release funds to winner. Can be called after deadline passes or if everyone signed.
    /// @param wagerId The ID of the resolved wager
    /// @dev Funds can be released if either all participants signed or the multi-sig deadline has passed.
    function releaseFunds(uint256 wagerId) external nonReentrant {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");
        require(
            wager.status == WagerStatus.RESOLVED,
            "Wager must be resolved"
        );
        require(
            block.timestamp >= wager.multiSigDeadline ||
                _allParticipantsSigned(wager),
            "Deadline not passed or not all signed"
        );

        _releaseFunds(wagerId);
    }

    // Internal function that actually sends the money to the winner
    function _releaseFunds(uint256 wagerId) internal {
        Wager storage wager = wagers[wagerId];
        require(wager.winner != address(0), "No winner set");
        require(wager.totalPledged > 0, "No funds to release");

        uint256 amount = wager.totalPledged;
        wager.totalPledged = 0; // Zero out first to prevent reentrancy

        (bool success, ) = payable(wager.winner).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(wagerId, wager.winner, amount);
    }

    // Checks if everyone who pledged has signed
    function _allParticipantsSigned(
        Wager storage wager
    ) internal view returns (bool) {
        for (uint256 i = 0; i < wager.participants.length; i++) {
            if (!wager.signatures[wager.participants[i].participant]) {
                return false;
            }
        }
        return true;
    }

    /// @notice Cancel a wager. Only creator or owner can do this.
    /// @param wagerId The ID of the wager to cancel
    /// @dev Can only cancel if no participants pledged yet, or if deadline passed and wager is not resolved.
    ///      All pledged funds are refunded to participants.
    function cancelWager(uint256 wagerId) external nonReentrant {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");
        require(
            msg.sender == wager.creator || msg.sender == owner(),
            "Only creator or owner can cancel"
        );
        require(
            wager.participants.length == 0 ||
                (block.timestamp > wager.deadline &&
                    wager.status != WagerStatus.RESOLVED),
            "Cannot cancel"
        );

        wager.status = WagerStatus.CANCELLED;

        // Refund all participants
        uint256 totalToRefund = wager.totalPledged;
        wager.totalPledged = 0; // Zero out first to prevent reentrancy
        
        for (uint256 i = 0; i < wager.participants.length; i++) {
            Participant memory p = wager.participants[i];
            (bool success, ) = payable(p.participant).call{
                value: p.pledgedAmount
            }("");
            require(success, "Refund failed");
        }

        emit WagerCancelled(wagerId);
    }

    // View functions - these don't modify state

    // Get all the details for a wager
    function getWager(
        uint256 wagerId
    )
        external
        view
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint256 minPledge,
            uint256 totalPledged,
            uint256 deadline,
            uint256 createdAt,
            WagerStatus status,
            address winner,
            uint256 resolvedAt,
            bool isPublic,
            uint256 multiSigDeadlineHours,
            uint256 multiSigDeadline,
            string memory marketId,
            uint256 participantCount
        )
    {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");

        return (
            wager.id,
            wager.title,
            wager.description,
            wager.creator,
            wager.minPledge,
            wager.totalPledged,
            wager.deadline,
            wager.createdAt,
            wager.status,
            wager.winner,
            wager.resolvedAt,
            wager.isPublic,
            wager.multiSigDeadlineHours,
            wager.multiSigDeadline,
            wager.marketId,
            wager.participants.length
        );
    }

    // Get list of all participants for a wager
    function getParticipants(
        uint256 wagerId
    )
        external
        view
        returns (
            address[] memory addresses,
            uint256[] memory amounts,
            bool[] memory signed,
            uint256[] memory pledgedAt
        )
    {
        Wager storage wager = wagers[wagerId];
        require(wager.id > 0, "Wager does not exist");

        uint256 count = wager.participants.length;
        addresses = new address[](count);
        amounts = new uint256[](count);
        signed = new bool[](count);
        pledgedAt = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            addresses[i] = wager.participants[i].participant;
            amounts[i] = wager.participants[i].pledgedAmount;
            signed[i] = wager.participants[i].hasSigned;
            pledgedAt[i] = wager.participants[i].pledgedAt;
        }
    }

    // Get all wager IDs for a specific user address
    function getUserWagers(
        address user
    ) external view returns (uint256[] memory) {
        return userWagers[user];
    }

    // Check if a specific user has signed the multi-sig for a wager
    function hasSigned(uint256 wagerId, address user) external view returns (bool) {
        return wagers[wagerId].signatures[user];
    }

    // Returns total count of wagers created
    function getWagerCount() external view returns (uint256) {
        return wagerCounter;
    }

    // Emergency function - only owner can call this
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
