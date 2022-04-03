// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract mainContract {
    function getGiven(address _charity, address _donor) external view returns (uint) {}
    function getRaised(address _charity, address _donor) external view returns (uint) {}

}

contract Ukraine is ERC721Enumerable, Ownable {
  using Strings for uint256;
  using SafeMath for uint256;

  string public baseURI;
  string public baseExtension = ".json";
  uint256 public maxMintAmount = 1;
  bool public paused = false;
  string public myContractURI = "ipfs://QmRuaELz54j9khRnWiiEidQBLZ9BmxBg2C9aY8buPDAYGG/";

  mapping(address => uint) public userTokens;   //for each user, select 1-25 image. Only allows one NFT owned.

  //add contract owner and charity
  address public owner1;
  address public charity;

  struct IndividualNft {
        string description;
        uint minDonated;
        uint maxDonated;
        uint minReferred;
        uint maxReferred;
        string link;
  }

  mapping(uint => IndividualNft) public potentialNfts;

  mainContract controller;



  constructor(
    string memory _name,
    string memory _symbol,
    string memory _initBaseURI,
    address _owner1,
    address _controller,
    address _charity
  ) ERC721(_name, _symbol) {

    setBaseURI(_initBaseURI);
    owner1 = _owner1;
    charity = _charity;

    controller = mainContract(_controller);

    //Wood
    _makeNFT("wood-wood", 0, 10**16, 0, 10**16, "ipfs://Qmb4n1deUMQwdZKVoBckKGNZvQQzFZC1ZgEpWzA36Rp9J4/");
    _makeNFT("wood-bronze", 0, 10**16, 10**16, 10**17, "ipfs://QmdTe4kb1GnVJYVFicrVHzN719iUzkwSKFMQuoLvVRuwXg/");
    _makeNFT("wood-silver";, 0, 10**16, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("wood-gold", 0, 10**16, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("wood-diamond", 0, 10**16, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");

    //Bronze
    _makeNFT("bronze-wood", 10**16, 10**17, 0, 10**16, "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
    _makeNFT("bronze-bronze", 10**16, 10**17, 10**16, 10**17,"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
    _makeNFT("bronze-silver", 10**16, 10**17, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("bronze-gold", 10**16, 10**17, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("bronze-diamond", 10**16, 10**17, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    

    //Silver
    _makeNFT("silver-wood", 10**17, 10**18, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/")
    _makeNFT("silver-bronze", 10**17, 10**18, 10**16, 10**17,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("silver-silver", 10**17, 10**18, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/";
    _makeNFT("silver-gold", 10**17, 10**18, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/";
    _makeNFT("silver-diamond", 10**17, 10**18, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");


    //Gold
    _makeNFT("gold-wood", 10**18, 10**19, 0, 10**16,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("gold-bronze", 10**18, 10**19, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("gold-silver", 10**18, 10**19, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("gold-gold", 10**18, 10**19, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("gold-diamond", 10**18, 10**19, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");


    //Diamond
    _makeNFT("diamond-wood", 10**19, 10**29, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("diamond-bronze", 10**19, 10**29, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("diamond-silver", 10**19, 10**29, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("diamond-gold", 10**19, 10**29, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    _makeNFT("wood-diamond", 10**19, 10**29, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
  }

 function _makeNFT(
     uint id,
     string _description,
     uint _minDonated,
     uint _maxDonated,
     uint _minReferred,
     uint _maxReferred,
     uint _link) internal {
        IndividualNft storage nft = potentialNfts[id];
        nft.description = _description;
        nft.minDonated = _minDonated;
        nft.maxDonated = _maxDonated;
        nft.minReferred = _minReferred;
        nft.maxReferred = _maxReferred;
        nft.link = _link;

     }

  // internal (override). leaving here to not break anything.
  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }


  // IMPLEMENT THIS
  //
  function mint(uint requested) public {
    require(requested < 26, "Requested token id cannot be above 25");
    require(requested > 0, "Requested token id cannot be under 1");
    require(!paused, "The contract is paused");

    //check that they don't already have one
    require(userTokens[msg.sender] == 0, "You already have an NFT");

    //request user's donations and referrals
    uint userDonations = controller.getGiven(charity, msg.sender);
    uint userReferrals = controller.getRaised(charity, msg.sender);

    //check that the requested is appropriate
    require(userDonations >= potentialNfts[requested].minDonated, "Not enough donated to request this level.");
    require(userDonations < potentialNfts[requested].maxDonated, "You donated more than this level requires. Request a higher level.");
    require(userReferrals >= potentialNfts[requested].minReferred, "Not enough referred to request this level.");
    require(userReferrals < potentialNfts[requested].maxReferred, "You referred more than this level requires. Request a higher level.");

    //add mapping of user address to nft metadata (1-25)
    userTokens[msg.sender] = requested;

    //mint nft
    uint256 supply = totalSupply();
    _safeMint(msg.sender, supply + 1);
    
  }


  function update(uint requested) public {
    require(requested < 26, "Requested token id cannot be above 25");
    require(requested > 0, "Requested token id cannot be under 1");
    require(!paused, "The contract is paused");

    //check that they don't already have one
    require(userTokens[msg.sender] != 0, "You don't have an NFT to update");

    //request user's donations and referrals
    uint userDonations = controller.getGiven(charity, msg.sender);
    uint userReferrals = controller.getRaised(charity, msg.sender);

    //check that the requested is appropriate
    require(userDonations >= potentialNfts[requested].minDonated, "Not enough donated to request this level.");
    require(userDonations < potentialNfts[requested].maxDonated, "You donated more than this level requires. Request a higher level.");
    require(userReferrals >= potentialNfts[requested].minReferred, "Not enough referred to request this level.");
    require(userReferrals < potentialNfts[requested].maxReferred, "You referred more than this level requires. Request a higher level.");

    //update mapping of user address to nft metadata (1-25)
    userTokens[msg.sender] = requested;

  }




  function walletOfOwner(address _owner) public view returns (uint256[] memory)
  {
    uint256 ownerTokenCount = balanceOf(_owner);
    uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    for (uint256 i; i < ownerTokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
    }
    return tokenIds;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(
      _exists(tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    address nftOwner = ownerOf(tokenId);
    uint nftIdentifier = userTokens[nftOwner];
    require(nftIdentifier > 0, "Something went wrong");
    require(nftIdentifier < 25, "Something went wrong");
    string memory myTokenUri = potentialNfts[nftIdentifier].link;


    return myTokenUri;
  }
  
  function contractURI() public view returns (string memory) {
        return myContractURI;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }
  
  function setContractURI(string memory _newContractURI) public onlyOwner {
    myContractURI = _newContractURI;
  }

  function pause(bool _state) public onlyOwner {
    paused = _state;
  }
 
  function withdraw() public payable onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }


  //Make tokens untransferrable
  function transferFrom(address from, address to, uint256 tokenId) public override {
      require (false, "You cannot transfer this NFT");
  }

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) public override {
      require (false, "You cannot transfer from this as well XD");
  }


  //getters
  function getTokenByUser(address _user) public view returns (uint) {
      uint nftIdentifier = userTokens[_user];
      return nftIdentifier;
  }

/*
  function getTokenUserDeserves(address _user) public view returns (uint) {
    uint userDonations = controller.getGiven(charity, msg.sender);
    uint userReferrals = controller.getRaised(charity, msg.sender);
    
    if (userDonations < 10**16) 

  }
*/

}