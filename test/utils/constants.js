const revertMessages = {
  onlyOwner: "Ownable: caller is not the owner",
  notZeroAddress: "CANNOT be Zero Address",
  notExistingCharity: "CANNOT be approved Charity",
  isExistingCharity: "Must be approved Charity",
  addressesNotEqual: "Addresses CANNOT be the same",
  needToBePositive: "Donation CANNOT be Zero",
  pendingNeedToBePositive: "Pending CANNOT be Zero"
};
  
module.exports = { revertMessages };
  