const { expect, assert, AssertionError} = require('chai');
const BigNumber = require('big-number');
const web3 = require("web3");

const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

const { revertMessagesUkraine } = require("./utils/constants.js");
let revertMessages = revertMessagesUkraine;

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
  
  describe("update", function() {
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
  describe("tokenURI reverts", function() {
    it ("invalid tokenURI", async function() {
      await expect(hardhatUkraine.connect(donor1).tokenURI(constants.ZERO_ADDRESS))
              .to.be
              .revertedWith(revertMessages.tokenURIExists);
    });
  });
  
  describe("transferFrom reverts", function() {
    it ("cannot transfer", async function() {
      await expect(hardhatUkraine.connect(donor1).transferFrom(donor1.address, donor2.address, 1))
              .to.be
              .revertedWith(revertMessages.cantTransfer);
    });
  });
  

describe("mint and update successfuls", function () {

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

describe("update", function() {
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

describe("tokenURI reverts", function() {
  it ("invalid tokenURI", async function() {
    await expect(hardhatUkraine.connect(donor1).tokenURI(constants.ZERO_ADDRESS))
            .to.be
            .revertedWith(revertMessages.tokenURIExists);
  });
});

describe("transferFrom reverts", function() {
  it ("cannot transfer", async function() {
    await expect(hardhatUkraine.connect(donor1).transferFrom(donor1.address, donor2.address, 1))
            .to.be
            .revertedWith(revertMessages.cantTransfer);
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
    addToNFTInfo(1, 0, ethAmount(.01), 0, ethAmount(.01), "ipfs://QmfPjyjJf52oLe9Tp4ZoL8ZY7QRMKcks4H7A9ZWJHiHBS4/");
    addToNFTInfo(2, 0, ethAmount(.01), ethAmount(.01), ethAmount(.1), "ipfs://QmQaaF5nD1owB2481Lv6io9vBaTuKvetRZAm4iR84F456b/");
    addToNFTInfo(3, 0, ethAmount(.01), ethAmount(.1), ethAmount(1), "ipfs://QmSd2ETNY3vHEyrHnd8AsqkuGxnaxNNXQSnZgDdGB8iHnW/");
    addToNFTInfo(4, 0, ethAmount(.01), ethAmount(1), ethAmount(10), "ipfs://Qmdb3fMH4NXJn2Q9uoabWmF43h6cxZvVL4eHAfZDDR1Mqt/");
    addToNFTInfo(5, 0, ethAmount(.01), ethAmount(10), ethAmount(10**11), "ipfs://QmajYunaTiq3LrLJYGSMKNBuj9h2vPT3XFder1crABSpAx/");
    //Bronze
    addToNFTInfo(6, ethAmount(.01), ethAmount(.1), 0, ethAmount(.01), "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
    addToNFTInfo(7, ethAmount(.01), ethAmount(.1), ethAmount(.01), ethAmount(.1),"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
    addToNFTInfo(8, ethAmount(.01), ethAmount(.1), ethAmount(.1), ethAmount(1), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(9, ethAmount(.01), ethAmount(.1), ethAmount(1), ethAmount(10), "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    addToNFTInfo(10, ethAmount(.01), ethAmount(.1), ethAmount(10), ethAmount(10**11), "ipfs://QmVo5i8kv57uQnExxTQS1ZwZpp2yCXYXimMRmXcfqKsH1v/");
    //Silver
    addToNFTInfo(11, ethAmount(.1), ethAmount(1), 0, ethAmount(.01), "ipfs://QmVrRJpVuNNg3QTZqLp7F9eiLuBZkTbVZMnjtj8HZGst1n/");
    addToNFTInfo(12, ethAmount(.1), ethAmount(1), ethAmount(.01), ethAmount(.1),"ipfs://QmWuE2x6dHamMVmekroarorwnteWmvRC6eCkmc1ieuhHzk/");
    addToNFTInfo(13, ethAmount(.1), ethAmount(1), ethAmount(.1), ethAmount(1), "ipfs://QmZNPAtkKStGGfHAaSQTQAVsnoqktsaiHMNSsBw7CQR2qU/");
    addToNFTInfo(14, ethAmount(.1), ethAmount(1), ethAmount(1), ethAmount(10), "ipfs://Qmb8mSjnoZTjA3qsnrK5fMh2Szy8rvaZnoKWK4c2aWkcPX/");
    addToNFTInfo(15, ethAmount(.1), ethAmount(1), ethAmount(10), ethAmount(10**11), "ipfs://QmaRpnbfuGhrQrBDjyuuw4KydeuNjQ7hbTGvVH8omWoo6s/");
    //Gold
    addToNFTInfo(16, ethAmount(1), ethAmount(10), 0, ethAmount(.01),"ipfs://QmUDhiscNYqeYXfWrjf5CcvZRST1gsfqrS1JQzP2C7qWYo/");
    addToNFTInfo(17, ethAmount(1), ethAmount(10), ethAmount(.01), ethAmount(.1), "ipfs://QmPHPcQfDiyk4DcBsCYrgZJWacMURjsa6UZvaZzcddY1B1/");
    addToNFTInfo(18, ethAmount(1), ethAmount(10), ethAmount(.1), ethAmount(1), "ipfs://QmYVq3p4VzFYJScu6RbZnxigoqZaozP6sHkcw94m73Pkfg/");
    addToNFTInfo(19, ethAmount(1), ethAmount(10), ethAmount(1), ethAmount(10), "ipfs://QmekkQpzFce7T9oHhsMyCUhJJvZybxRLXS1bM3yzRw2xwU/");
    addToNFTInfo(20, ethAmount(1), ethAmount(10), ethAmount(10), ethAmount(10**11), "ipfs://QmQ4w989pG5zQFoQ7jA6zUC3aZrzoNzriYJiQLy8uwC8qM/");
    //Diamond
    addToNFTInfo(21, ethAmount(10), ethAmount(10**11), 0, ethAmount(.01), "ipfs://QmbX2L1rA3weNywBtqMwRQNdhzDrNro1yrKV5RMWQ9XDGX/");
    addToNFTInfo(22, ethAmount(10), ethAmount(10**11), ethAmount(.01), ethAmount(.1), "ipfs://QmPyvxBxZoiXtwc4GuQQALBVsw3wgdMkYe21pe1kfZWDuc/");
    addToNFTInfo(23, ethAmount(10), ethAmount(10**11), ethAmount(.1), ethAmount(1), "ipfs://QmNzLRvbfxasA41aEbTgfUhB2yJ19EiEpQXoSd1bPaQzpp/");
    addToNFTInfo(24, ethAmount(10), ethAmount(10**11), ethAmount(1), ethAmount(10), "ipfs://QmZdW6Va54wJDQ6MUxRJswwcXqoAoz2zmXRvK8EhNJPvR2/");
    addToNFTInfo(25, ethAmount(10), ethAmount(10**11), ethAmount(10), ethAmount(10**11), "ipfs://QmR6aABhut77FDLLuSHMQ6L2zabxELCmRkQKAWaGn4aewX/");
}

function ethAmount(amount) {
    return web3.utils.toWei(amount.toString(), 'ether')
}

async function getBalance(address) {
    var balance = (await ethers.provider.getBalance(address)) / 1e18;
    return balance;
}


async function checkNFTInfo(nft, number) {
    expect(nft.minGiven).to.equal(await nftInfo[number].minGiven);
    expect(nft.maxGiven).to.equal(await nftInfo[number].maxGiven);
    expect(nft.minRaised).to.equal(await nftInfo[number].minRaised);
    expect(nft.maxRaised).to.equal(await nftInfo[number].maxRaised);
    expect(nft.link).to.equal(await nftInfo[number].link);

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

