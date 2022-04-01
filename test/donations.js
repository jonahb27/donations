const { expect, assert, AssertionError} = require('chai');
const BigNumber = require('big-number');

const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { revertMessages } = require("./utils/constants.js");
const { ERC165 } = require('@openzeppelin/test-helpers/src/makeInterfaceId');

let owner;
let char1;
let char2;
let donor1;
let donor2;
let nft1;
let nft2;
let signerList;
let hardhatRound;

beforeEach(async () => {
  signerList = await ethers.getSigners(); // get accounts
  [owner, char1, char2, donor1, donor2, nft1, nft2] = signerList;
  const Donations = await ethers.getContractFactory("Donations");
  hardhatDonations= await Donations.deploy();
});

describe("on deployment", function () {
  it("contract exists", async function () {
    await checkCharity(constants.ZERO_ADDRESS, 0, 0, false, constants.ZERO_ADDRESS);
  });
});

describe("addCharity", function () {

  describe("addCharity reverts", function () {

    it("onlyOwner", async function () {
      await expect(
        hardhatDonations.connect(donor1)
                        .addCharity(char1.address, nft1.address))
                        .to.be.revertedWith(revertMessages.onlyOwner
      );
    });

    it("notZeroAddress", async function () {
      await expect(
        hardhatDonations.connect(owner)
                        .addCharity(constants.ZERO_ADDRESS, nft1.address))
                        .to.be.revertedWith(revertMessages.notZeroAddress
      );
      await expect(
        hardhatDonations.connect(owner)
                        .addCharity(char1.address, constants.ZERO_ADDRESS))
                        .to.be.revertedWith(revertMessages.notZeroAddress
      );

      await expect(
        hardhatDonations.connect(owner)
                        .addCharity(constants.ZERO_ADDRESS, constants.ZERO_ADDRESS))
                        .to.be.revertedWith(revertMessages.notZeroAddress
      );
    });

    it("notExistingCharity", async function () {
      await expect(
        hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      );
      await checkCharity(char1.address, 0, 0, true, nft1.address);
      await expect(
        hardhatDonations.connect(owner)
                        .addCharity(char1.address, nft1.address))
                        .to.be.revertedWith(revertMessages.notExistingCharity
      );
    });
  });

  describe("basic addCharity Functionalty", function () {
    it("basic create", async function () {
      //charity not created
      await checkCharity(char1.address, 0, 0, false, constants.ZERO_ADDRESS);

      //add charity
      await expect(hardhatDonations.connect(owner).addCharity(char1.address, nft1.address))
        .to.emit(hardhatDonations, "NewCharity")
        .withArgs(char1.address, nft1.address);

      //its created
      await checkCharity(char1.address, 0, 0, true, nft1.address);
    });

    it("create 2 charities", async function () {
      //charity not created
      await checkCharity(char1.address, 0, 0, false, constants.ZERO_ADDRESS);
      await checkCharity(char2.address, 0, 0, false, constants.ZERO_ADDRESS);

      //add charity 1
      await expect(hardhatDonations.connect(owner).addCharity(char1.address, nft1.address))
        .to.emit(hardhatDonations, "NewCharity")
        .withArgs(char1.address, nft1.address);

      //its created
      await checkCharity(char1.address, 0, 0, true, nft1.address);
      await checkCharity(char2.address, 0, 0, false, constants.ZERO_ADDRESS);

      //add charity 2
      await expect(hardhatDonations.connect(owner).addCharity(char2.address, nft2.address))
        .to.emit(hardhatDonations, "NewCharity")
        .withArgs(char2.address, nft2.address);
      
      //its created
      await checkCharity(char1.address, 0, 0, true, nft1.address);
      await checkCharity(char2.address, 0, 0, true, nft2.address);
    });

  });
});

async function checkCharity(charityAddress, totalRaised, totalPending, approved, erc721Address) {
  var charity = await hardhatDonations.charities(charityAddress)
  expect(charity.totalRaised).to.equal(totalRaised);
  expect(charity.totalPending).to.equal(totalPending);
  expect(charity.approved).to.equal(approved);
  expect(charity.erc721).to.equal(erc721Address);
}