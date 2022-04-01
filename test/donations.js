const { expect, assert, AssertionError} = require('chai');
const BigNumber = require('big-number');
const web3 = require("web3");

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
    await checkDonor(donor1.address, char1.address, 0, 0);
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


describe("donate", function () {
  describe("donation reverts", function () {
    // not an existing charity

    it("donate to nonexisting charity", async function () {
      await expect(
        hardhatDonations
          .connect(donor1)
          .donate(char1.address, { value: ethAmount(3) })
      ).to.be.revertedWith(revertMessages.isExistingCharity);
    });

    it("donate charity to charity", async function () {
      await hardhatDonations
        .connect(owner)
        .addCharity(char1.address, nft1.address);

      await expect(
        hardhatDonations.connect(char1).donate(char1.address)
      ).to.be.revertedWith(revertMessages.notExistingCharity);
    });

    it("donate charity to charity 2", async function () {
      await hardhatDonations
        .connect(owner)
        .addCharity(char1.address, nft1.address);

      await hardhatDonations
        .connect(owner)
        .addCharity(char2.address, nft2.address);

      await expect(
        hardhatDonations.connect(char1).donate(char2.address)
      ).to.be.revertedWith(revertMessages.notExistingCharity);
    });

    it("donate 0 to charity", async function () {
      await hardhatDonations
        .connect(owner)
        .addCharity(char1.address, nft1.address);

      await hardhatDonations
        .connect(owner)
        .addCharity(char2.address, nft2.address);

      await expect(
        hardhatDonations
          .connect(donor1)
          .donate(char2.address, { value: ethAmount(0) })
      ).to.be.revertedWith(revertMessages.needToBePositive);
    });
  });

  describe("donation basics", function () {
    this.beforeEach(async () => {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
    });

    it("basic donate", async function () {
      await checkDonor(donor1.address, char1.address, 0, 0);

      await expect(hardhatDonations
              .connect(donor1)
              .donate(char1.address, { value: ethAmount(3)}))
              .to.emit(hardhatDonations, "NewDonation")
              .withArgs(char1.address, donor1.address, ethAmount(3));

      await checkCharity(char1.address, ethAmount(3), ethAmount(3), true, nft1.address);

      await checkDonor(donor1.address, char1.address, ethAmount(3), 0);

    });

    it("basic double donate", async function () {
      await checkDonor(donor1.address, char1.address, 0, 0);

      await expect(hardhatDonations
              .connect(donor1)
              .donate(char1.address, { value: ethAmount(3)}))
              .to.emit(hardhatDonations, "NewDonation")
              .withArgs(char1.address, donor1.address, ethAmount(3));

      await checkCharity(char1.address, ethAmount(3), ethAmount(3), true, nft1.address);

      await checkDonor(donor1.address, char1.address, ethAmount(3), 0);

      await expect(hardhatDonations
        .connect(donor1)
        .donate(char1.address, { value: ethAmount(3)}))
        .to.emit(hardhatDonations, "NewDonation")
        .withArgs(char1.address, donor1.address, ethAmount(3));


      await checkCharity(char1.address, ethAmount(6), ethAmount(6), true, nft1.address);

      await checkDonor(donor1.address, char1.address, ethAmount(6), 0);
    });

  });
});

describe("donateWithRefferral", function () {
  describe("donateWithRefferral reverts", function() {
    it ("donateWithRefferal non existing charity", async function() {
      await expect(
        hardhatDonations
          .connect(donor1)
          .donateWithRefferral(char1.address, donor2.address)
        ).to.be.revertedWith(revertMessages.isExistingCharity);

    });

    it ("donateWithRefferal refferer zero address", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor1)
          .donateWithRefferral(char1.address, constants.ZERO_ADDRESS)
        ).to.be.revertedWith(revertMessages.notZeroAddress);

    });

    it ("donateWithRefferal refferer zero address 2", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor2)
          .donateWithRefferral(char2.address, constants.ZERO_ADDRESS)
        ).to.be.revertedWith(revertMessages.notZeroAddress);

    });

    it ("donateWithRefferal charity to charity", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(char1)
          .donateWithRefferral(char2.address, donor2.address)
        ).to.be.revertedWith(revertMessages.notExistingCharity);

    });

    it ("donateWithRefferal charity to charity 2", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(char2)
          .donateWithRefferral(char1.address, donor1.address)
        ).to.be.revertedWith(revertMessages.notExistingCharity);

    });

    it ("donateWithRefferal donor and refferer equal", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor1)
          .donateWithRefferral(char1.address, donor1.address)
        ).to.be.revertedWith(revertMessages.addressesNotEqual);

    });

    it ("donateWithRefferal donor and refferer equal 2", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor2)
          .donateWithRefferral(char2.address, donor2.address)
        ).to.be.revertedWith(revertMessages.addressesNotEqual);

    });

    it ("donateWithRefferal zero donation", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor1)
          .donateWithRefferral(char1.address, donor2.address, {value: ethAmount(0)})
        ).to.be.revertedWith(revertMessages.needToBePositive);

    });

    it ("donateWithRefferal zero donation 2", async function() {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
      await hardhatDonations.connect(owner).addCharity(char2.address, nft2.address)


      await expect(
        hardhatDonations
          .connect(donor2)
          .donateWithRefferral(char2.address, donor1.address, {value: ethAmount(0)})
        ).to.be.revertedWith(revertMessages.needToBePositive);

    });

  });

  describe("donateWithRefferral basic", function () {

    this.beforeEach(async () => {
      await hardhatDonations.connect(owner).addCharity(char1.address, nft1.address)
    });

    it("basic donateWithRefferral", async function () {
      await checkDonor(donor1.address, char1.address, 0, 0);
      await checkDonor(donor2.address, char1.address, 0, 0);


      await expect(hardhatDonations
              .connect(donor1)
              .donateWithRefferral(char1.address, donor2.address, {value: ethAmount(3)}))
              .to.emit(hardhatDonations, "NewDonationWithRefferal")
              .withArgs(char1.address, donor1.address, donor2.address, ethAmount(3));

      await checkCharity(char1.address, ethAmount(3), ethAmount(3), true, nft1.address);
      await checkDonor(donor1.address, char1.address, ethAmount(3), 0);
      await checkDonor(donor2.address, char1.address, 0, ethAmount(3));

    });

    it("double donateWithRefferral", async function () {
      await checkDonor(donor1.address, char1.address, 0, 0);
      await checkDonor(donor2.address, char1.address, 0, 0);
      
      await expect(hardhatDonations
              .connect(donor1)
              .donateWithRefferral(char1.address, donor2.address, {value: ethAmount(3)}))
              .to.emit(hardhatDonations, "NewDonationWithRefferal")
              .withArgs(char1.address, donor1.address, donor2.address, ethAmount(3));

      await checkCharity(char1.address, ethAmount(3), ethAmount(3), true, nft1.address);
      await checkDonor(donor1.address, char1.address, ethAmount(3), 0);
      await checkDonor(donor2.address, char1.address, 0, ethAmount(3));

      await expect(hardhatDonations
        .connect(donor2)
        .donateWithRefferral(char1.address, donor1.address, {value: ethAmount(3)}))
        .to.emit(hardhatDonations, "NewDonationWithRefferal")
        .withArgs(char1.address, donor2.address, donor1.address, ethAmount(3));

      await checkCharity(char1.address, ethAmount(6), ethAmount(6), true, nft1.address);
      await checkDonor(donor1.address, char1.address, ethAmount(3), ethAmount(3));
      await checkDonor(donor2.address, char1.address, ethAmount(3), ethAmount(3));

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

async function checkDonor(donorAddress, charityAddress, given, raised) {
  var donor = await hardhatDonations.donors(charityAddress, donorAddress)
  expect(donor.given).to.equal(given);
  expect(donor.raised).to.equal(raised);
}

function ethAmount(amount) {
  return web3.utils.toWei(amount.toString(), 'ether')
}