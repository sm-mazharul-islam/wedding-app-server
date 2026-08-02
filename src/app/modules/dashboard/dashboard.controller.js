const catchAsync = require("../../utils/catchAsync");
const dashboardService = require("./dashboard.service");

const getDashboardStats = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await dashboardService.getDashboardStatsFromDB(email);
  res.send(result);
});

module.exports = {
  getDashboardStats,
};
