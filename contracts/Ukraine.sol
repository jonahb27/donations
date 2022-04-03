// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract IDonations {
    function getGiven(address _charity, address _donor) external view returns (uint){}
    function getRaised(address _charity, address _donor) external view returns (uint){}
}

contract Ukraine is ERC721Enumerable, Ownable {

    using Strings for uint256;
    using SafeMath for uint256;

    IDonations controller;
    bool public paused = false;
    string public myContractURI;
    address public charity;

    struct IndividualNft {
        string description;
        uint minDonated;
        uint maxDonated;
        uint minReferred;
        uint maxReferred;
        string link;
    }

    mapping(address => uint) public userTokens;  //address --> their nft
    mapping(uint => IndividualNft) public potentialNfts; //(1 -25) --> token info



    constructor(
        string memory _name,
        string memory _symbol,
        string memory _myContractURI,
        address _controller,
        address _charity)
        ERC721(_name, _symbol)
        {
        myContractURI = _myContractURI;
        charity = _charity;
        controller = IDonations(_controller);
        _makeAllNFTs();
    }

    //----------Modifiers-----------
    modifier inRange(uint requested) {
        require(requested >= 1 && requested <= 25, "Token not in range");
        _;
    }

    modifier qualifies(uint requested) {
        uint given = controller.getGiven(charity, msg.sender);
        uint raised = controller.getRaised(charity, msg.sender);
        IndividualNft memory nft = potentialNfts[requested];
        bool isQualified = (given >= nft.minDonated) &&
                           (given < nft.maxDonated) &&
                           (raised >= nft.minReferred) &&
                           (raised < nft.maxReferred);
        require(isQualified, "Not qualified for this NFT");
        _;
    }

    modifier isNotPaused() {
        require(!paused, "The contract is paused");
        _;
    }

    modifier doesntHaveNFT() {
        require(userTokens[msg.sender] == 0, "You already have an NFT");
        _;
    }

    modifier hasNFT() {
        require(userTokens[msg.sender] != 0, "You need an NFT");
        _;
    }

    //------external functions --------
    function mint(uint requested)
        external
        inRange(requested)
        isNotPaused
        doesntHaveNFT
        qualifies(requested)
        {
        //mint nft
        uint256 supply = totalSupply();
        _safeMint(msg.sender, supply.add(1));
        userTokens[msg.sender] = requested;
    }


    function update(uint requested)
        external
        inRange(requested)
        isNotPaused
        hasNFT
        qualifies(requested)
        {
        userTokens[msg.sender] = requested;
    }


    // function walletOfOwner(address _owner) public view returns (uint256[] memory) {
    //     uint256 ownerTokenCount = balanceOf(_owner);
    //     uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    //     for (uint256 i; i < ownerTokenCount; i++) {
    //         tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
    //     }
    //     return tokenIds;
    // }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        address nftOwner = ownerOf(tokenId);
        uint nftIdentifier = userTokens[nftOwner];
        string memory myTokenUri = potentialNfts[nftIdentifier].link;
        return myTokenUri;
    }

    function contractURI() public view returns (string memory) {
        return myContractURI;
    }


    function setContractURI(string memory _newContractURI) public onlyOwner {
        myContractURI = _newContractURI;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }


    // Make tokens untransferrable
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require (false, "CANNOT Transfer");
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public override {
        require (false, "CANNOT Transfer");
    }

    //----- getters -----
    function getTokenByUser(address _user) public view returns (uint) {
        uint nftIdentifier = userTokens[_user];
        return nftIdentifier;
    }

    //-------internal functions ---
    function _makeNFT(
        uint id,
        string memory _description,
        uint _minDonated,
        uint _maxDonated,
        uint _minReferred,
        uint _maxReferred,
        string memory _link)
        internal {
        IndividualNft storage nft = potentialNfts[id];
        nft.description = _description;
        nft.minDonated = _minDonated;
        nft.maxDonated = _maxDonated;
        nft.minReferred = _minReferred;
        nft.maxReferred = _maxReferred;
        nft.link = _link;

    }

    function _makeAllNFTs() internal {
        //Wood
        _makeNFT(1, "wood-wood", 0, 10**16, 0, 10**16, "ipfs://Qmb4n1deUMQwdZKVoBckKGNZvQQzFZC1ZgEpWzA36Rp9J4/");
        _makeNFT(2, "wood-bronze", 0, 10**16, 10**16, 10**17, "ipfs://QmdTe4kb1GnVJYVFicrVHzN719iUzkwSKFMQuoLvVRuwXg/");
        _makeNFT(3, "wood-silver", 0, 10**16, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(4, "wood-gold", 0, 10**16, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(5, "wood-diamond", 0, 10**16, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Bronze
        _makeNFT(6, "bronze-wood", 10**16, 10**17, 0, 10**16, "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
        _makeNFT(7, "bronze-bronze", 10**16, 10**17, 10**16, 10**17,"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
        _makeNFT(8, "bronze-silver", 10**16, 10**17, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(9, "bronze-gold", 10**16, 10**17, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(10, "bronze-diamond", 10**16, 10**17, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Silver
        _makeNFT(11, "silver-wood", 10**17, 10**18, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(12, "silver-bronze", 10**17, 10**18, 10**16, 10**17,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(13, "silver-silver", 10**17, 10**18, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(14, "silver-gold", 10**17, 10**18, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(15, "silver-diamond", 10**17, 10**18, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Gold
        _makeNFT(16, "gold-wood", 10**18, 10**19, 0, 10**16,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(17, "gold-bronze", 10**18, 10**19, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(18, "gold-silver", 10**18, 10**19, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(19, "gold-gold", 10**18, 10**19, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(20, "gold-diamond", 10**18, 10**19, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Diamond
        _makeNFT(21, "diamond-wood", 10**19, 10**29, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(22, "diamond-bronze", 10**19, 10**29, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(23, "diamond-silver", 10**19, 10**29, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(24, "diamond-gold", 10**19, 10**29, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(25, "wood-diamond", 10**19, 10**29, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    }
}