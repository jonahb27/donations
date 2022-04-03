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
    await checkDonor(donor1.address, char1.address, 0, 0);
    await checkCharity(constants.ZERO_ADDRESS, 0, 0, false, constants.ZERO_ADDRESS);
    await checkCharity(char1.address, 0, 0, true);
  });

  it("data of nfts is correct", async function () {
    for(let i = 0; i <=25; i ++) {
        let nft = await hardhatUkraine.potentialNfts(i);
        checkNFTInfo(nft, i);
    }
  });



  it("add contract and donate", async function () {
    await hardhatDonations.connect(owner).addCharity(char2.address);
    await hardhatDonations.connect(donor1).donate(char2.address, {value : ethAmount(3)});
    await checkDonor(donor1.address, char1.address, 0, 0);
    await checkCharity(constants.ZERO_ADDRESS, 0, 0, false, constants.ZERO_ADDRESS);
    await checkCharity(char1.address, 0, 0, true);
    await checkCharity(char2.address, ethAmount(3), ethAmount(3), true);
    await checkDonor(donor1.address, char2.address, ethAmount(3), 0);
    await checkDonor(donor2.address, char2.address, 0, 0);
    await checkDonor(donor2.address, char1.address, 0, 0);

  });

});
describe("mint", function() {
  describe("mint reverts", function() {
    it ("mint in range reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});

      await expect(hardhatUkraine.connect(donor1).mint(0))
      .to.be
      .revertedWith(revertMessages.inRange);

      await expect(hardhatUkraine.connect(donor1).mint(30))
      .to.be
      .revertedWith(revertMessages.inRange);
    });

    it ("mint is paused reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await hardhatUkraine.connect(owner).pause(true);

      await expect(hardhatUkraine.connect(donor1).mint(2))
      .to.be
      .revertedWith(revertMessages.isNotPaused);
    });

    it ("mint has NFT reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await hardhatUkraine.connect(donor1).mint(16);
      await expect(hardhatUkraine.connect(donor1).mint(16))
      .to.be
      .revertedWith(revertMessages.doesntHaveNFT);

    });

    it ("mint does not qualify reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await expect(hardhatUkraine.connect(donor1).mint(14))
      .to.be
      .revertedWith(revertMessages.qualifies);
    });
    

  });
});

describe.only("update", function() {
  describe("update reverts", function() {
    it ("update in range reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await hardhatUkraine.connect(donor1).mint(16);
      await expect(hardhatUkraine.connect(donor1).update(0))
            .to.be
            .revertedWith(revertMessages.inRange);

    });

    it ("update paused reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await hardhatUkraine.connect(donor1).mint(16);
      await hardhatUkraine.connect(owner).pause(true);
      await expect(hardhatUkraine.connect(donor1).update(16))
            .to.be
            .revertedWith(revertMessages.isNotPaused);
      
    });

    it ("update hasNFT reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await expect(hardhatUkraine.connect(donor1).update(16))
            .to.be
            .revertedWith(revertMessages.hasNFT);
      
    });

    it ("update qualifies reverts", async function() {
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(1)});
      await hardhatUkraine.connect(donor1).mint(16);
      await hardhatDonations.connect(donor1).donate(char1.address, {value : ethAmount(10)});
      await expect(hardhatUkraine.connect(donor1).update(16))
            .to.be
            .revertedWith(revertMessages.qualifies);
      
    });
    

  });


});
describe.only("tokenURI reverts", function() {
  it ("invalid tokenURI", async function() {
    await expect(hardhatUkraine.connect(donor1).tokenURI(constants.ZERO_ADDRESS))
            .to.be
            .revertedWith(revertMessages.tokenURIExists);
  });
});

describe.only("transferFrom reverts", function() {
  it ("cannot transfer", async function() {
    await expect(hardhatUkraine.connect(donor1).transferFrom(donor1.address, donor2.address, 1))
            .to.be
            .revertedWith(revertMessages.cantTransfer);
  });
});

// describe.only("safeTransferFrom reverts", function() {
//   it ("cannot transfer", async function() {
//     await expect(hardhatUkraine.connect(donor1).safeTransferFrom(donor1.address, donor2.address, 1))
//             .to.be
//             .revertedWith(revertMessages.cantTransfer);
//   });
// });

// describe.only("setContactURI reverts", function() {
//   it ("not owner", async function() {
//     await expect(hardhatUkraine.connect(donor1).setContactURI("eiwjoaf"))
//             .to.be
//             .revertedWith(revertMessages.onlyOwner);
//   });
// });


// describe.only("pause reverts", function() {
  
//     it ("cannot transfer", async function() {
//       await expect(hardhatUkraine.connect(donor1).pause(true))
//               .to.be
//               .revertedWith(revertMessages.notOwner);
//     });
  
// });

// describe.only("withdraw reverts", function() {
  
//     it ("cannot transfer", async function() {
//       await expect(hardhatUkraine.connect(donor1).withdraw())
//               .to.be
//               .revertedWith(revertMessages.notOwner);
//     });
  
// });



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

async function checkNFTInfo(nft, number) {
    expect(nft.minDonated).to.equal(nftInfo[number].minDonated);
    expect(nft.maxDonated).to.equal(nftInfo[number].maxDonated);
    expect(nft.minReferred).to.equal(nftInfo[number].minReferred);
    expect(nft.maxReferred).to.equal(nftInfo[number].maxReferred);
    expect(nft.link).to.equal(nftInfo[number].link);

}

function ethAmount(amount) {
  return web3.utils.toWei(amount.toString(), 'ether')
}

async function checkCharity(charityAddress, totalRaised, totalPending, approved) {
  var charity = await hardhatDonations.charities(charityAddress)
  expect(charity.totalRaised).to.equal(totalRaised);
  expect(charity.totalPending).to.equal(totalPending);
  expect(charity.approved).to.equal(approved);
}

async function checkDonor(donorAddress, charityAddress, given, raised) {
  var donor = await hardhatDonations.donors(charityAddress, donorAddress)
  expect(donor.given).to.equal(given);
  expect(donor.raised).to.equal(raised);
}

