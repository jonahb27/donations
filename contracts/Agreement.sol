// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.0;
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Agreement
/// @author Jonah Burian, Anna Lulushi
contract Agreement {
    using Counters for Counters.Counter;
    Counters.Counter private interactionId;

    mapping(uint =>  Interaction) public InteractionMap;

    struct Interaction {
        address partyA;
        address partyB;
        string data;
        bool accepted;
    }

    //----------Events--------------
    event newPost(uint interactionId, address partyA, address partyB, string data);
    event newAccept(uint interactionId, address partyA, address partyB, string data);

    //----------Modifiers-----------
    modifier notAccepted(uint _interactionId) {
        require(!InteractionMap[_interactionId].accepted, "Already Accepted");
        _;
    }

    modifier isPartyB(uint _interactionId) {
        require(InteractionMap[_interactionId].partyB == msg.sender, "Not Correct Party");
        _;
    }
    
    modifier notZeroAddress(address _address) {
        require(_address != address(0), "CANNOT be Zero Address");
        _;
    }

    //-------external functions ---
    function post(address _partyB, string memory _data)
        external
        notZeroAddress(msg.sender)
        notZeroAddress(_partyB)
        {
        _post(_partyB, _data);
    }

    function accept(uint _interactionId)
        external
        notAccepted(_interactionId)
        isPartyB(_interactionId)
        {
        _accept(_interactionId);
    }

     //-------internal functions ---
    function _post(address _partyB, string memory _data) internal {
        uint _interactionId = interactionId.current();
        Interaction storage a = InteractionMap[_interactionId];
        address _partyA = msg.sender;
        
        a.partyA = _partyA;
        a.partyB = _partyB;
        a.data = _data;

        emit newPost(_interactionId, _partyA, _partyB, _data);

        interactionId.increment();
    }

    function _accept(uint _interactionId) internal {
        Interaction storage a = InteractionMap[_interactionId];
        a.accepted = true;
        emit newAccept(_interactionId, a.partyA, a.partyB, a.data);
    }

}