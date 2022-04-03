// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Donations is Ownable {
    using SafeMath for uint;

    struct Donor {
        uint given;
        uint raised;
    }

    struct Charity {
        uint totalRaised;
        uint totalPending;
        bool approved;
    }

    mapping(address => Charity) public charities;
    mapping(address => mapping(address=> Donor)) public donors;

    //----------Events--------------

    event NewCharity(address charity);

    event NewDonation(address charity, address donor, uint amount);

    event NewDonationWithRefferal(address charity, address donor, address refferer, uint amount);

    event Withdrawl(address charity, uint amount);


    //----------Modifiers-----------
    modifier notZeroAddress(address _address) {
        require(_address != address(0), "CANNOT be Zero Address");
        _;
    }

    modifier notExistingCharity(address _charity) {
        require(!charities[_charity].approved, "CANNOT be approved Charity");
        _;
    }

    modifier isExistingCharity(address _charity) {
        require(charities[_charity].approved, "Must be approved Charity");
        _;
    }

    modifier addressesNotEqual(address _add1, address _add2) {
        require(_add1 != _add2, "Addresses CANNOT be the same");
        _;
    }

    //-------external functions ---

    function renounceOwnership() public virtual onlyOwner override {
        require(false, "Owner CANNOT be renounced");
    }

    function addCharity(address _charity)
        external
        onlyOwner
        notZeroAddress(_charity)
        notExistingCharity(_charity)
        {
        _addCharity(_charity);
    }

    function withdraw()
        external
        isExistingCharity(msg.sender)
        {
        _withdraw(msg.sender);
    }

    function saveFunds(address _charity)
        external
        onlyOwner
        isExistingCharity(_charity)
        {
        _withdraw(_charity);
    }

    function donate(address _charity)
        external payable
        isExistingCharity(_charity)
        notExistingCharity(msg.sender)
        {
        uint amount = msg.value;
        require(amount > 0, "Donation CANNOT be Zero");
        _donate(_charity, amount);
        emit NewDonation(_charity, msg.sender, amount);
    }

    function donateWithRefferral(address _charity, address _refferer)
        external payable
        isExistingCharity(_charity)
        notZeroAddress(_refferer)
        notExistingCharity(msg.sender)
        addressesNotEqual(msg.sender, _refferer)
        {
        uint amount = msg.value;
        require(amount > 0, "Donation CANNOT be Zero");
        _donateWithRefferral(_charity, _refferer, amount);
        emit NewDonationWithRefferal(_charity, msg.sender, _refferer, amount);
    }

    //-------internal functions ---
    function _addCharity(address _charity) internal {
        Charity storage charity = charities[_charity];
        charity.totalRaised = 0;
        charity.totalPending = 0;
        charity.approved = true;
        emit NewCharity(_charity);
    }

    function _withdraw(address _charity) internal {
        Charity storage charity = charities[_charity];
        uint amount = charity.totalPending;
        require(amount > 0, "Pending CANNOT be Zero");
        charity.totalPending = 0;
        payable(_charity).transfer(amount);
        emit Withdrawl(_charity, amount);
    }


    function _donate(address _charity, uint _amount) internal {
        address sender = msg.sender;
        Charity storage charity = charities[_charity];
        Donor storage donor = donors[_charity][sender];
        donor.given = donor.given.add(_amount);
        charity.totalRaised = charity.totalRaised.add(_amount);
        charity.totalPending = charity.totalPending.add(_amount);
    }

    function _donateWithRefferral(address _charity, address _refferer, uint _amount) internal {
        Donor storage refferer = donors[_charity][_refferer];
        refferer.raised = refferer.raised.add(_amount);
        _donate(_charity, _amount);
    }


    //-------getters functions ---
    function getGiven(address _charity, address _donor) external view returns (uint amount) {
       return donors[_charity][_donor].given;
    }

    function getRaised(address _charity, address _donor) external view returns (uint amount) {
       return donors[_charity][_donor].raised;
    }

    function getTotalRaised(address _charity) external view returns (uint amount) {
       return charities[_charity].totalRaised;
    }
}