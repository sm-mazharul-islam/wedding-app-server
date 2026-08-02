const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getUnlockedCollection = () => getCollection("unlockPremium");

const unlockPremiumProfileInDB = async (payload) => {
  const { userEmail, biodataId, biodataName, biodataImage, biodataAddress } =
    payload;

  if (!userEmail || !biodataId || !userEmail.includes("@")) {
    throw new AppError(400, "Invalid request! Provide valid email and ID.");
  }

  if (userEmail === "undefined" || userEmail === "null") {
    throw new AppError(401, "Unauthorized! Please login first.");
  }

  const collection = getUnlockedCollection();
  const existing = await collection.findOne({
    userEmail: userEmail.toLowerCase(),
    biodataId: biodataId,
  });

  if (existing) {
    throw new AppError(400, "You have already unlocked this profile!");
  }

  const unlockInfo = {
    userEmail: userEmail.toLowerCase(),
    biodataId,
    biodataName,
    biodataImage,
    biodataAddress,
    unlockDate: new Date(),
    status: "unlocked",
  };

  const result = await collection.insertOne(unlockInfo);
  return result;
};

const getUnlockedRequestsByEmailFromDB = async (emailParam) => {
  const collection = getUnlockedCollection();
  const email = emailParam.toLowerCase();
  const query = { userEmail: email };
  const result = await collection
    .find(query)
    .sort({ unlockDate: -1 })
    .toArray();
  return result;
};

const getAllUnlockedRequestsFromDB = async () => {
  const collection = getUnlockedCollection();
  const result = await collection.find().toArray();
  return result;
};

const deleteUnlockedRequestFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getUnlockedCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

module.exports = {
  unlockPremiumProfileInDB,
  getUnlockedRequestsByEmailFromDB,
  getAllUnlockedRequestsFromDB,
  deleteUnlockedRequestFromDB,
};
