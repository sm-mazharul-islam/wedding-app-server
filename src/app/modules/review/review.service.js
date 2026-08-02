const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getReviewCollection = () => getCollection("reviews");

const createReviewInDB = async (payload) => {
  const collection = getReviewCollection();
  const result = await collection.insertOne(payload);
  return result;
};

const getAllReviewsFromDB = async () => {
  const collection = getReviewCollection();
  const reviews = await collection.find({}).toArray();
  return reviews;
};

const deleteReviewFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getReviewCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

const pinReviewInDB = async (id, isPinned) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getReviewCollection();
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { isPinned },
  };
  const result = await collection.updateOne(filter, updateDoc);
  return result;
};

const getPinnedReviewsFromDB = async () => {
  const collection = getReviewCollection();
  const query = { isPinned: true };
  const result = await collection.find(query).toArray();
  return result;
};

module.exports = {
  createReviewInDB,
  getAllReviewsFromDB,
  deleteReviewFromDB,
  pinReviewInDB,
  getPinnedReviewsFromDB,
};
