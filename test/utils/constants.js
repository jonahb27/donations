const revertMessagesDonations = {
  onlyOwner: "Ownable: caller is not the owner",
  notZeroAddress: "CANNOT be Zero Address",
  notExistingCharity: "CANNOT be approved Charity",
  isExistingCharity: "Must be approved Charity",
  addressesNotEqual: "Addresses CANNOT be the same",
  needToBePositive: "Donation CANNOT be Zero",
  pendingNeedToBePositive: "Pending CANNOT be Zero",
};

const revertMessagesUkraine = {
  onlyOwner: "Ownable: caller is not the owner",
  inRange: "Token not in range",
  qualifies: "Not qualified for this NFT",
  isNotPaused: "The contract is paused",
  doesntHaveNFT: "You already have an NFT",
  hasNFT: "You need an NFT",
  tokenURIExists: "ERC721Metadata: URI query for nonexistent token",
  cantTransfer: "CANNOT Transfer"
};
  
module.exports = { revertMessagesDonations, revertMessagesUkraine };
  