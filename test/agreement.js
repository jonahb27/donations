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
let addr1;
let addr2;
let addr3;
let addr4;
let addr5;
let erc1;
let erc2;
let signerList;
let hardhatRound;

beforeEach(async () => {
  signerList = await ethers.getSigners(); // get accounts
  [owner, addr1, addr2, addr3, addr4, addr5] = signerList;
  const Agreement = await ethers.getContractFactory("Agreement");
  hardhatAgreement= await Agreement.deploy();
});

describe("on deployment", function () {
  it("contract exists", async function () {
    var interaction = await hardhatAgreement.InteractionMap(0)
    console.log(interaction)
    expect(interaction.partyA).to.equal(constants.ZERO_ADDRESS);
    expect(interaction.partyB).to.equal(constants.ZERO_ADDRESS);
    expect(interaction.data).to.equal('');
    expect(interaction.accepted).to.equal(false);
  });
});