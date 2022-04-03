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
let signerList;
let hardhatDonations;
let hardhatUkraine;

var nftInfo = new Map();
makeNfts();
console.log(nftInfo)

beforeEach(async () => {
  signerList = await ethers.getSigners(); // get accounts
  [owner, char1, char2, donor1, donor2] = signerList;
  const Donations = await ethers.getContractFactory("Donations");
  hardhatDonations= await Donations.deploy();
  
  await expect(hardhatDonations.connect(owner).addCharity(char1.address))
        .to.emit(hardhatDonations, "NewCharity")
        .withArgs(char1.address);

  const Ukraine = await ethers.getContractFactory("Ukraine");
  hardhatUkraine = await Ukraine.deploy(
      "Ukraine Donations - Altruia", 
      "UKR", 
      "ipfs://QmRFsUjs9Q3D9CBY7CFGG8r6pFTbYC8pPAQozxoFPf5QQr/", 
      hardhatDonations.address, 
      char1.address
    );
});

describe.only("on deployment", function () {
  it("contract exists", async function () {
    // await checkDonor(donor1.address, char1.address, 0, 0);
    // await checkCharity(constants.ZERO_ADDRESS, 0, 0, false, constants.ZERO_ADDRESS);
    assert(true);
    // for(var i = 0; i <=25; i ++) {
    //     console.log(await hardhatUkraine.potentialNfts(i))
    // }
  });

  it("contract exists", async function () {
    // var nft1 = await hardhatUkraine.potentialNfts(1);
    // expect(nft1.description).to.be.equal("wood-wood");
  });
});



function addToNFTInfo(id, _minDonated, _maxDonated, _minReferred, _maxReferred, _link) {
    let nft = new Object();
    nft.minDonated = _minDonated;
    nft.maxDonated = _maxDonated;
    nft.minReferred = _minReferred;
    nft.maxReferred = _maxReferred;
    nft.link = _link;
    nftInfo[id] = nft;
}
function makeNfts() {
    //Wood
    addToNFTInfo(1, 0, 10**16, 0, 10**16, "ipfs://Qmb4n1deUMQwdZKVoBckKGNZvQQzFZC1ZgEpWzA36Rp9J4/");
    addToNFTInfo(2, 0, 10**16, 10**16, 10**17, "ipfs://QmdTe4kb1GnVJYVFicrVHzN719iUzkwSKFMQuoLvVRuwXg/");
    addToNFTInfo(3, 0, 10**16, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(4, 0, 10**16, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(5, 0, 10**16, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Bronze
    addToNFTInfo(6, 10**16, 10**17, 0, 10**16, "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
    addToNFTInfo(7, 10**16, 10**17, 10**16, 10**17,"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
    addToNFTInfo(8, 10**16, 10**17, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(9, 10**16, 10**17, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(10, 10**16, 10**17, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Silver
    addToNFTInfo(11, 10**17, 10**18, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(12, 10**17, 10**18, 10**16, 10**17,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(13, 10**17, 10**18, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(14, 10**17, 10**18, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(15, 10**17, 10**18, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Gold
    addToNFTInfo(16, 10**18, 10**19, 0, 10**16,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(17, 10**18, 10**19, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(18, 10**18, 10**19, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(19, 10**18, 10**19, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(20, 10**18, 10**19, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Diamond
    addToNFTInfo(21, 10**19, 10**29, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(22, 10**19, 10**29, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(23, 10**19, 10**29, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(24, 10**19, 10**29, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(25, 10**19, 10**29, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
}