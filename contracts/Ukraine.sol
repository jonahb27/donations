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
        _makeNFT(1, 0, 10**16, 0, 10**16, "ipfs://QmfPjyjJf52oLe9Tp4ZoL8ZY7QRMKcks4H7A9ZWJHiHBS4/");
        _makeNFT(2, 0, 10**16, 10**16, 10**17, "ipfs://QmQaaF5nD1owB2481Lv6io9vBaTuKvetRZAm4iR84F456b/");
        _makeNFT(3, 0, 10**16, 10**17, 10**18, "ipfs://QmSd2ETNY3vHEyrHnd8AsqkuGxnaxNNXQSnZgDdGB8iHnW/");
        _makeNFT(4, 0, 10**16, 10**18, 10**19, "ipfs://Qmdb3fMH4NXJn2Q9uoabWmF43h6cxZvVL4eHAfZDDR1Mqt/");
        _makeNFT(5, 0, 10**16, 10**19, 10**29, "ipfs://QmajYunaTiq3LrLJYGSMKNBuj9h2vPT3XFder1crABSpAx/");
        //Bronze
        _makeNFT(6, 10**16, 10**17, 0, 10**16, "ipfs://QmdehT6B8E6BAGPVQZVdtmpqgnVCMEd1pr18M4FEDzV6e5/");
        _makeNFT(7, 10**16, 10**17, 10**16, 10**17,"ipfs://QmXAqiyq8NH2AtERMQLSu8Jp7vZwwuCaJbUjhFnbgxeASY/");
        _makeNFT(8, 10**16, 10**17, 10**17, 10**18, "ipfs://QmVCqbiEqt2kS3bDq9uL9EMVKhPQDcuMFMNQuY96uR3WSR/");
        _makeNFT(9, 10**16, 10**17, 10**18, 10**19, "ipfs://QmYje9HUYifqG84hHv5NpTnMPye3JkHUNY6tvp7kJMY8Qr/");
        _makeNFT(10, 10**16, 10**17, 10**19, 10**29, "ipfs://QmVo5i8kv57uQnExxTQS1ZwZpp2yCXYXimMRmXcfqKsH1v/");
        //Silver
        _makeNFT(11, 10**17, 10**18, 0, 10**16, "ipfs://QmVrRJpVuNNg3QTZqLp7F9eiLuBZkTbVZMnjtj8HZGst1n/");
        _makeNFT(12, 10**17, 10**18, 10**16, 10**17,"ipfs://QmWuE2x6dHamMVmekroarorwnteWmvRC6eCkmc1ieuhHzk/");
        _makeNFT(13, 10**17, 10**18, 10**17, 10**18, "ipfs://QmZNPAtkKStGGfHAaSQTQAVsnoqktsaiHMNSsBw7CQR2qU/");
        _makeNFT(14, 10**17, 10**18, 10**18, 10**19, "ipfs://Qmb8mSjnoZTjA3qsnrK5fMh2Szy8rvaZnoKWK4c2aWkcPX/");
        _makeNFT(15, 10**17, 10**18, 10**19, 10**29, "ipfs://QmaRpnbfuGhrQrBDjyuuw4KydeuNjQ7hbTGvVH8omWoo6s/");
        //Gold
        _makeNFT(16, 10**18, 10**19, 0, 10**16,"ipfs://QmUDhiscNYqeYXfWrjf5CcvZRST1gsfqrS1JQzP2C7qWYo/");
        _makeNFT(17, 10**18, 10**19, 10**16, 10**17, "ipfs://QmPHPcQfDiyk4DcBsCYrgZJWacMURjsa6UZvaZzcddY1B1/");
        _makeNFT(18, 10**18, 10**19, 10**17, 10**18, "ipfs://QmYVq3p4VzFYJScu6RbZnxigoqZaozP6sHkcw94m73Pkfg/");
        _makeNFT(19, 10**18, 10**19, 10**18, 10**19, "ipfs://QmekkQpzFce7T9oHhsMyCUhJJvZybxRLXS1bM3yzRw2xwU/");
        _makeNFT(20, 10**18, 10**19, 10**19, 10**29, "ipfs://QmQ4w989pG5zQFoQ7jA6zUC3aZrzoNzriYJiQLy8uwC8qM/");
        //Diamond
        _makeNFT(21, 10**19, 10**29, 0, 10**16, "ipfs://QmbX2L1rA3weNywBtqMwRQNdhzDrNro1yrKV5RMWQ9XDGX/");
        _makeNFT(22, 10**19, 10**29, 10**16, 10**17, "ipfs://QmPyvxBxZoiXtwc4GuQQALBVsw3wgdMkYe21pe1kfZWDuc/");
        _makeNFT(23, 10**19, 10**29, 10**17, 10**18, "ipfs://QmNzLRvbfxasA41aEbTgfUhB2yJ19EiEpQXoSd1bPaQzpp/");
        _makeNFT(24, 10**19, 10**29, 10**18, 10**19, "ipfs://QmZdW6Va54wJDQ6MUxRJswwcXqoAoz2zmXRvK8EhNJPvR2/");
        _makeNFT(25, 10**19, 10**29, 10**19, 10**29, "ipfs://QmR6aABhut77FDLLuSHMQ6L2zabxELCmRkQKAWaGn4aewX/");
    }
}