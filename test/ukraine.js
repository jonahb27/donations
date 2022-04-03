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

describe("on deployment", function () {
  it("contract exists", async function () {
    // await checkDonor(donor1.address, char1.address, 0, 0);
    // await checkCharity(constants.ZERO_ADDRESS, 0, 0, false, constants.ZERO_ADDRESS);
    assert(true);
    // for(var i = 0; i <=25; i ++) {
    //     console.log(await hardhatUkraine.potentialNfts(i))
    // }
  });

//   it("data of nfts is correct", async function () {
//     for(let i = 0; i <=25; i ++) {
//         let nft = await hardhatUkraine.potentialNfts(i);
//         checkNFTInfo(nft, i);
//     }
//   });
});

describe.only("mint and update checker", function () {

    it("simple donate", async function () {
        let signers = signerList.slice(5)
        for(let i = 2; i <= 14; i++){
            let minGiven = nftInfo[i].minGiven;
            let minRaised = nftInfo[i].minRaised;
            if(minGiven > 0) {
                await hardhatDonations.connect(signers[i]).donate(char1.address, { value: minGiven});
            }
            if(minRaised > 0) {
                await hardhatDonations.connect(signers[i-1]).donateWithRefferral(char1.address, signers[i].address, { value: minRaised});
            }
            await hardhatUkraine.connect(signers[i]).mint(i)
            expect(await hardhatUkraine.userTokens(signers[i].address)).to.be.equal(i)
        }
    });

    it("simple update", async function () {
        let minGiven = nftInfo[6].minGiven;
        await hardhatDonations.connect(donor1).donate(char1.address, { value: minGiven});
        await hardhatUkraine.connect(donor1).mint(6)
        expect(await hardhatUkraine.userTokens(donor1.address)).to.be.equal(6)

        minGiven = nftInfo[11].minGiven;
        await hardhatDonations.connect(donor1).donate(char1.address, { value: minGiven});
        await hardhatUkraine.connect(donor1).update(11)
        expect(await hardhatUkraine.userTokens(donor1.address)).to.be.equal(11)

        minRaised = nftInfo[12].minRaised;
        await hardhatDonations.connect(donor2).donateWithRefferral(char1.address, donor1.address, { value: minRaised});
        await hardhatUkraine.connect(donor1).update(12)
        expect(await hardhatUkraine.userTokens(donor1.address)).to.be.equal(12)
    });
    
});



function addToNFTInfo(id, _minGiven, _maxGiven, _minRaised, _maxRaised, _link) {
    let nft = new Object();
    nft.minGiven = _minGiven;
    nft.maxGiven = _maxGiven;
    nft.minRaised = _minRaised;
    nft.maxRaised = _maxRaised;
    nft.link = _link;
    nftInfo[id] = nft;
}
function makeNfts() {
    //Wood
    addToNFTInfo(1, 0, ethAmount(.01), 0, ethAmount(.01), "ipfs://Qmb4n1deUMQwdZKVoBckKGNZvQQzFZC1ZgEpWzA36Rp9J4/");
    addToNFTInfo(2, 0, ethAmount(.01), ethAmount(.01), ethAmount(.1), "ipfs://QmdTe4kb1GnVJYVFicrVHzN719iUzkwSKFMQuoLvVRuwXg/");
    addToNFTInfo(3, 0, ethAmount(.01), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(4, 0, ethAmount(.01), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(5, 0, ethAmount(.01), ethAmount(10), ethAmount(10**11), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Bronze
    addToNFTInfo(6, ethAmount(.01), ethAmount(.1), 0, ethAmount(.01), "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
    addToNFTInfo(7, ethAmount(.01), ethAmount(.1), ethAmount(.01), ethAmount(.1),"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
    addToNFTInfo(8, ethAmount(.01), ethAmount(.1), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(9, ethAmount(.01), ethAmount(.1), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(10, ethAmount(.01), ethAmount(.1), ethAmount(10), ethAmount(10**11), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Silver
    addToNFTInfo(11, ethAmount(.1), ethAmount(1), 0, ethAmount(.01), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(12, ethAmount(.1), ethAmount(1), ethAmount(.01), ethAmount(.1),"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(13, ethAmount(.1), ethAmount(1), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(14, ethAmount(.1), ethAmount(1), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(15, ethAmount(.1), ethAmount(1), ethAmount(10), ethAmount(10**11), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Gold
    addToNFTInfo(16, ethAmount(1), ethAmount(10), 0, ethAmount(.01),"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(17, ethAmount(1), ethAmount(10), ethAmount(.01), ethAmount(.1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(18, ethAmount(1), ethAmount(10), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(19, ethAmount(1), ethAmount(10), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(20, ethAmount(1), ethAmount(10), ethAmount(10), ethAmount(10**11), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    //Diamond
    addToNFTInfo(21, ethAmount(10), ethAmount(10**11), 0, ethAmount(.01), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(22, ethAmount(10), ethAmount(10**11), ethAmount(.01), ethAmount(.1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(23, ethAmount(10), ethAmount(10**11), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(24, ethAmount(10), ethAmount(10**11), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(25, ethAmount(10), ethAmount(10**11), ethAmount(10), ethAmount(10**11), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
}

function ethAmount(amount) {
    return web3.utils.toWei(amount.toString(), 'ether')
}

async function getBalance(address) {
    var balance = (await ethers.provider.getBalance(address)) / 1e18;
    return balance;
}
