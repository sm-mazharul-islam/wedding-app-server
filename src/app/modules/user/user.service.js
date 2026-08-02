const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getUsersCollection = () => getCollection("users");

const createUserIntoDB = async (user) => {
  const collection = getUsersCollection();
  const existingUser = await collection.findOne({ email: user.email });
  if (existingUser) {
    return { acknowledged: true };
  }
  const result = await collection.insertOne(user);
  return result;
};

const getAllUsersFromDB = async () => {
  const collection = getUsersCollection();
  const result = await collection.find().toArray();
  return result;
};

const getUserRoleFromDB = async (email) => {
  const collection = getUsersCollection();
  const user = await collection.findOne({ email });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return { role: user?.role || "user" };
};

const updateUserRoleInDB = async (id, role) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getUsersCollection();
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = { $set: { role } };
  const result = await collection.updateOne(filter, updatedDoc);
  return result;
};

const deleteUserFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getUsersCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

module.exports = {
  createUserIntoDB,
  getAllUsersFromDB,
  getUserRoleFromDB,
  updateUserRoleInDB,
  deleteUserFromDB,
};
