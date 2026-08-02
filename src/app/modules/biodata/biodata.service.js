const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getBiodataCollection = () => getCollection("biodata");
const getUnlockedCollection = () => getCollection("unlockPremium");

const createBiodataInDB = async (payload) => {
  const collection = getBiodataCollection();
  const data = {
    ...payload,
    createdAt: new Date(),
  };
  const result = await collection.insertOne(data);
  return result;
};

const updateBiodataInDB = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getBiodataCollection();
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedBiodata = { $set: payload };
  const result = await collection.updateOne(filter, updatedBiodata, options);
  return result;
};

const deleteBiodataFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getBiodataCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
};

const getSingleBiodataFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getBiodataCollection();
  const unlockedCollection = getUnlockedCollection();

  const query = { _id: new ObjectId(id) };
  const result = await collection.findOne(query);

  if (!result) {
    throw new AppError(404, "Biodata not found");
  }

  const premiumCount = await unlockedCollection.countDocuments({
    biodataId: id,
  });

  return { ...result, premiumCount };
};

const getAllBiodataFromDB = async () => {
  const collection = getBiodataCollection();
  const result = await collection
    .aggregate([
      {
        $addFields: { stringId: { $toString: "$_id" } },
      },
      {
        $lookup: {
          from: "unlockPremium",
          localField: "stringId",
          foreignField: "biodataId",
          as: "unlocks",
        },
      },
      {
        $addFields: { premiumCount: { $size: "$unlocks" } },
      },
      {
        $project: { stringId: 0, unlocks: 0 },
      },
    ])
    .toArray();
  return result;
};

module.exports = {
  createBiodataInDB,
  updateBiodataInDB,
  deleteBiodataFromDB,
  getSingleBiodataFromDB,
  getAllBiodataFromDB,
};
