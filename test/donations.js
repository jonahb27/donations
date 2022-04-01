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
let signerList;
let hardhatRound;

beforeEach(async () => {
  signerList = await ethers.getSigners(); // get accounts
  [owner, char1, char2, donor1, donor2, nft1] = signerList;
  const Donations = await ethers.getContractFactory("Donations");
  hardhatDonations= await Donations.deploy();
});

describe("on deployment", function () {
  it("contract exists", async function () {
    var charity = await hardhatDonations.charities(constants.ZERO_ADDRESS)
    expect(charity.totalRaised).to.equal(0);
    expect(charity.totalPending).to.equal(0);
    expect(charity.approved).to.equal(false);
    expect(charity.erc721).to.equal(constants.ZERO_ADDRESS);
  });
});

describe("addCharity", function () {

  describe("addCharity reverts", function () {

    it("onlyOwner", async function () {
      await expect(
        hardhatDonations
          .connect(donor1)
          .addCharity(char1.address, nft1.address))
          .to.be.revertedWith(
              revertMessages.onlyOwner
      );
    });


  });
});