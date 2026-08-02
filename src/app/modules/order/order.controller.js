const catchAsync = require("../../utils/catchAsync");
const orderService = require("./order.service");

const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrderInDB(req.body);
  res.send(result);
});

module.exports = {
  createOrder,
};
