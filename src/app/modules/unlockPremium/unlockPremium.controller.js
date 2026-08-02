const catchAsync = require("../../utils/catchAsync");
const unlockPremiumService = require("./unlockPremium.service");

const unlockPremiumProfile = catchAsync(async (req, res) => {
  const result = await unlockPremiumService.unlockPremiumProfileInDB(req.body);
  res.status(200).send(result);
});

const getUnlockedRequestsByEmail = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await unlockPremiumService.getUnlockedRequestsByEmailFromDB(
    email,
  );
  res.send(result);
});

const getAllUnlockedRequests = catchAsync(async (req, res) => {
  const result = await unlockPremiumService.getAllUnlockedRequestsFromDB();
  res.send(result);
});

const deleteUnlockedRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await unlockPremiumService.deleteUnlockedRequestFromDB(id);
  res.send(result);
});

module.exports = {
  unlockPremiumProfile,
  getUnlockedRequestsByEmail,
  getAllUnlockedRequests,
  deleteUnlockedRequest,
};
