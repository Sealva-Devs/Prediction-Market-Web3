// Sources flattened with hardhat v2.28.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/WagerContract.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


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

    // Creates a new wager. Returns the wager ID.
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

        userWagers[msg.sender].push(wagerId);

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

    // Pledge funds to a wager. Creator has to pledge first.
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

    // Resolves the wager and sets the winner. Only creator or owner can call this.
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

    // Sign the multi-sig. If everyone signs, funds release automatically.
    function signMultiSig(uint256 wagerId) external {
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

    // Release funds to winner. Can be called after deadline passes or if everyone signed.
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

    // Cancel a wager. Only creator can do this, and only if no one pledged yet or deadline passed.
    function cancelWager(uint256 wagerId) external {
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
