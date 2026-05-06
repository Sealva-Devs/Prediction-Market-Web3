const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WagerContract", function () {
  let wagerContract;
  let owner;
  let creator;
  let participant1;
  let participant2;
  let otherAccounts;

  beforeEach(async function () {
    [owner, creator, participant1, participant2, ...otherAccounts] =
      await ethers.getSigners();

    const WagerContract = await ethers.getContractFactory("WagerContract");
    wagerContract = await WagerContract.deploy();
    await wagerContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await wagerContract.getAddress()).to.be.properAddress;
    });

    it("Should set the right owner", async function () {
      expect(await wagerContract.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Wagers", function () {
    it("Should create a wager successfully", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400; // day from now
      const tx = await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "This is a test wager",
          ethers.parseEther("0.1"),
          deadline,
          24, // hours for multi-sig
          true,
          "market-123"
        );

      await expect(tx)
        .to.emit(wagerContract, "WagerCreated")
        .withArgs(
          1,
          creator.address,
          "Test Wager",
          ethers.parseEther("0.1"),
          deadline,
          true
        );

      const wager = await wagerContract.getWager(1);
      expect(wager.id).to.equal(1);
      expect(wager.title).to.equal("Test Wager");
      expect(wager.creator).to.equal(creator.address);
    });

    it("Should reject wager with invalid deadline", async function () {
      const pastDeadline = Math.floor(Date.now() / 1000) - 86400;
      await expect(
        wagerContract
          .connect(creator)
          .createWager(
            "Test",
            "Description",
            ethers.parseEther("0.1"),
            pastDeadline,
            24,
            true,
            ""
          )
      ).to.be.revertedWith("Deadline must be in future");
    });

    it("Should reject wager with zero min pledge", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 86400;
      await expect(
        wagerContract
          .connect(creator)
          .createWager("Test", "Description", 0, deadline, 24, true, "")
      ).to.be.revertedWith("Min pledge must be > 0");
    });
  });

  describe("Pledging", function () {
    let wagerId;
    let deadline;

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400;
      const tx = await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "Description",
          ethers.parseEther("0.1"),
          deadline,
          24,
          true,
          ""
        );
      const receipt = await tx.wait();
      wagerId = 1;
    });

    it("Should allow creator to pledge first", async function () {
      await expect(
        wagerContract
          .connect(creator)
          .pledge(wagerId, { value: ethers.parseEther("0.1") })
      )
        .to.emit(wagerContract, "Pledged")
        .withArgs(wagerId, creator.address, ethers.parseEther("0.1"));

      const wager = await wagerContract.getWager(wagerId);
      expect(wager.totalPledged).to.equal(ethers.parseEther("0.1"));
      expect(wager.status).to.equal(1); // PENDING
    });

    it("Should reject pledge from non-creator before creator pledges", async function () {
      await expect(
        wagerContract
          .connect(participant1)
          .pledge(wagerId, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Creator must pledge first");
    });

    it("Should allow others to pledge after creator", async function () {
      // Creator pledges first
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });

      // Participant pledges
      await expect(
        wagerContract
          .connect(participant1)
          .pledge(wagerId, { value: ethers.parseEther("0.2") })
      )
        .to.emit(wagerContract, "Pledged")
        .withArgs(wagerId, participant1.address, ethers.parseEther("0.2"));

      const wager = await wagerContract.getWager(wagerId);
      expect(wager.totalPledged).to.equal(ethers.parseEther("0.3"));
      expect(wager.status).to.equal(2); // ACTIVE (2+ participants)
    });

    it("Should reject pledge below minimum", async function () {
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });

      await expect(
        wagerContract
          .connect(participant1)
          .pledge(wagerId, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should reject duplicate pledge from same address", async function () {
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });

      await expect(
        wagerContract
          .connect(creator)
          .pledge(wagerId, { value: ethers.parseEther("0.2") })
      ).to.be.revertedWith("Already pledged to this wager");
    });
  });

  describe("Resolving Wagers", function () {
    let wagerId;
    let deadline;

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400;
      await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "Description",
          ethers.parseEther("0.1"),
          deadline,
          24,
          true,
          ""
        );
      wagerId = 1;

      // Creator and participant pledge
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });
      await wagerContract
        .connect(participant1)
        .pledge(wagerId, { value: ethers.parseEther("0.2") });
    });

    it("Should allow creator to resolve wager", async function () {
      await expect(
        wagerContract.connect(creator).resolveWager(wagerId, participant1.address)
      )
        .to.emit(wagerContract, "WagerResolved")
        .withArgs(wagerId, participant1.address, ethers.parseEther("0.3"));

      const wager = await wagerContract.getWager(wagerId);
      expect(wager.status).to.equal(3); // RESOLVED
      expect(wager.winner).to.equal(participant1.address);
    });

    it("Should reject resolution from non-creator", async function () {
      await expect(
        wagerContract
          .connect(participant1)
          .resolveWager(wagerId, participant1.address)
      ).to.be.revertedWith("Only creator or owner can resolve");
    });

    it("Should reject resolution with non-participant winner", async function () {
      await expect(
        wagerContract
          .connect(creator)
          .resolveWager(wagerId, otherAccounts[0].address)
      ).to.be.revertedWith("Winner must be participant");
    });
  });

  describe("Multi-Sig Signing", function () {
    let wagerId;
    let deadline;

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400;
      await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "Description",
          ethers.parseEther("0.1"),
          deadline,
          24,
          true,
          ""
        );
      wagerId = 1;

      // Creator and participant pledge
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });
      await wagerContract
        .connect(participant1)
        .pledge(wagerId, { value: ethers.parseEther("0.2") });

      // Resolve with participant1 as winner
      await wagerContract
        .connect(creator)
        .resolveWager(wagerId, participant1.address);
    });

    it("Should allow participants to sign multi-sig", async function () {
      await expect(
        wagerContract.connect(creator).signMultiSig(wagerId)
      )
        .to.emit(wagerContract, "SignatureAdded")
        .withArgs(wagerId, creator.address);

      expect(await wagerContract.hasSigned(wagerId, creator.address)).to.be.true;
    });

    it("Should reject signature from non-participant", async function () {
      await expect(
        wagerContract.connect(otherAccounts[0]).signMultiSig(wagerId)
      ).to.be.revertedWith("Must be participant");
    });

    it("Should auto-release funds when all participants sign", async function () {
      // Both participants sign
      await wagerContract.connect(creator).signMultiSig(wagerId);
      await expect(
        wagerContract.connect(participant1).signMultiSig(wagerId)
      )
        .to.emit(wagerContract, "SignatureAdded")
        .withArgs(wagerId, participant1.address)
        .to.emit(wagerContract, "FundsReleased")
        .withArgs(wagerId, participant1.address, ethers.parseEther("0.3"));
    });
  });

  describe("Fund Release", function () {
    let wagerId;
    let deadline;

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400;
      await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "Description",
          ethers.parseEther("0.1"),
          deadline,
          1, // 1 hour for multi-sig
          true,
          ""
        );
      wagerId = 1;

      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });
      await wagerContract
        .connect(participant1)
        .pledge(wagerId, { value: ethers.parseEther("0.2") });

      await wagerContract
        .connect(creator)
        .resolveWager(wagerId, participant1.address);
    });

    it("Should allow release after deadline even without all signatures", async function () {
      // Fast forward time by 2 hours
      await ethers.provider.send("evm_increaseTime", [7200]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await ethers.provider.getBalance(
        participant1.address
      );

      const tx = await wagerContract.connect(participant1).releaseFunds(wagerId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(wagerContract, "FundsReleased")
        .withArgs(wagerId, participant1.address, ethers.parseEther("0.3"));

      const finalBalance = await ethers.provider.getBalance(
        participant1.address
      );
      // Balance should increase by 0.3 ETH minus gas costs
      const expectedIncrease = ethers.parseEther("0.3");
      const actualIncrease = finalBalance - initialBalance;
      expect(actualIncrease + gasUsed).to.equal(expectedIncrease);
    });
  });

  describe("Cancellation", function () {
    let wagerId;
    let deadline;

    beforeEach(async function () {
      deadline = Math.floor(Date.now() / 1000) + 86400;
      await wagerContract
        .connect(creator)
        .createWager(
          "Test Wager",
          "Description",
          ethers.parseEther("0.1"),
          deadline,
          24,
          true,
          ""
        );
      wagerId = 1;
    });

    it("Should allow creator to cancel before any pledges", async function () {
      await expect(wagerContract.connect(creator).cancelWager(wagerId))
        .to.emit(wagerContract, "WagerCancelled")
        .withArgs(wagerId);

      const wager = await wagerContract.getWager(wagerId);
      expect(wager.status).to.equal(4); // CANCELLED
    });

    it("Should refund participants when cancelled after deadline", async function () {
      await wagerContract
        .connect(creator)
        .pledge(wagerId, { value: ethers.parseEther("0.1") });

      // Fast forward past deadline
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await ethers.provider.getBalance(creator.address);

      await wagerContract.connect(creator).cancelWager(wagerId);

      const finalBalance = await ethers.provider.getBalance(creator.address);
      // Balance should increase (refund minus gas)
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
