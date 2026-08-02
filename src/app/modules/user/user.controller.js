const catchAsync = require("../../utils/catchAsync");
const userService = require("./user.service");

const createUser = catchAsync(async (req, res) => {
  const result = await userService.createUserIntoDB(req.body);
  res.send(result);
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsersFromDB();
  res.send(result);
});

const getUserRole = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await userService.getUserRoleFromDB(email);
  res.send(result);
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const result = await userService.updateUserRoleInDB(id, role);
  res.send(result);
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUserFromDB(id);
  res.status(200).send(result);
});

module.exports = {
  createUser,
  getAllUsers,
  getUserRole,
  updateUserRole,
  deleteUser,
};
