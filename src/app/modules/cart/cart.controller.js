const catchAsync = require("../../utils/catchAsync");
const cartService = require("./cart.service");

const saveOrUpdateCart = catchAsync(async (req, res) => {
  const result = await cartService.saveOrUpdateCartInDB(req.body);
  res.send(result);
});

const getUserCart = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await cartService.getUserCartFromDB(email);
  res.send(result);
});

module.exports = {
  saveOrUpdateCart,
  getUserCart,
};
