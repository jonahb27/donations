// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

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
        uint minGiven;
        uint maxGiven;
        uint minRaised;
        uint maxRaised;
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
        bool isQualified = (given != 0 || raised != 0) &&
                           (given >= nft.minGiven) &&
                           (given < nft.maxGiven) &&
                           (raised >= nft.minRaised) &&
                           (raised < nft.maxRaised);
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
        uint _minGiven,
        uint _maxGiven,
        uint _minRaised,
        uint _maxRaised,
        string memory _link)
        internal {
        IndividualNft storage nft = potentialNfts[id];
        nft.minGiven = _minGiven;
        nft.maxGiven = _maxGiven;
        nft.minRaised = _minRaised;
        nft.maxRaised = _maxRaised;
        nft.link = _link;

    }

    function _makeAllNFTs() internal {
        //Wood
        _makeNFT(1, 0, 10**16, 0, 10**16, "ipfs://Qmb4n1deUMQwdZKVoBckKGNZvQQzFZC1ZgEpWzA36Rp9J4/");
        _makeNFT(2, 0, 10**16, 10**16, 10**17, "ipfs://QmdTe4kb1GnVJYVFicrVHzN719iUzkwSKFMQuoLvVRuwXg/");
        _makeNFT(3, 0, 10**16, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(4, 0, 10**16, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(5, 0, 10**16, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Bronze
        _makeNFT(6, 10**16, 10**17, 0, 10**16, "ipfs://QmVvo5CNcqz7KbsbunbEhzBYJHXj6aEeaN5xPgP3nwvojS/");
        _makeNFT(7, 10**16, 10**17, 10**16, 10**17,"ipfs://QmWd8iUhiq492aXWmDND8uTAeNVa2GShAZzAQEnKzs5rE8/");
        _makeNFT(8, 10**16, 10**17, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(9, 10**16, 10**17, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(10, 10**16, 10**17, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Silver
        _makeNFT(11, 10**17, 10**18, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(12, 10**17, 10**18, 10**16, 10**17,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(13, 10**17, 10**18, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(14, 10**17, 10**18, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(15, 10**17, 10**18, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Gold
        _makeNFT(16, 10**18, 10**19, 0, 10**16,"ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(17, 10**18, 10**19, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(18, 10**18, 10**19, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(19, 10**18, 10**19, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(20, 10**18, 10**19, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        //Diamond
        _makeNFT(21, 10**19, 10**29, 0, 10**16, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(22, 10**19, 10**29, 10**16, 10**17, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(23, 10**19, 10**29, 10**17, 10**18, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(24, 10**19, 10**29, 10**18, 10**19, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
        _makeNFT(25, 10**19, 10**29, 10**19, 10**29, "ipfs://QmfKJqXArXg6mG2YSQBHGwzfnyNTbvxcoTcLt5x4cADy9C/");
    }
}