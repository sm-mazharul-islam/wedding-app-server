const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getServicesPackageCollection = () => getCollection("servicesPackage");

const createPackageInDB = async (payload) => {
  const collection = getServicesPackageCollection();
  const result = await collection.insertOne(payload);
  return result;
};

const getAllPackagesFromDB = async () => {
  const collection = getServicesPackageCollection();
  const result = await collection.find({}).toArray();
  return result;
};

const getSinglePackageFromDB = async (id) => {
  if (!id || id === "undefined" || !ObjectId.isValid(id) || id.length !== 24) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getServicesPackageCollection();
  const result = await collection.findOne({ _id: new ObjectId(id) });
  if (!result) {
    throw new AppError(404, "Service package not found");
  }
  return result;
};

const updatePackageQuantityInDB = async (id, quantity) => {
  if (!id || id === "undefined" || !ObjectId.isValid(id) || id.length !== 24) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getServicesPackageCollection();
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = { $inc: { inStock: -quantity } };
  const result = await collection.updateOne(filter, updatedDoc);
  return result;
};

const updatePackageDetailsInDB = async (id, payload) => {
  if (!id || id === "undefined" || !ObjectId.isValid(id) || id.length !== 24) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getServicesPackageCollection();
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      name: payload.name,
      nameTwo: payload.nameTwo,
      priceOne: payload.priceOne,
      image: payload.image,
      descriptionTwo: payload.descriptionTwo,
    },
  };
  const result = await collection.updateOne(filter, updateDoc);
  return result;
};

const deletePackageFromDB = async (id) => {
  if (!id || id === "undefined" || !ObjectId.isValid(id) || id.length !== 24) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getServicesPackageCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

module.exports = {
  createPackageInDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB,
  updatePackageQuantityInDB,
  updatePackageDetailsInDB,
  deletePackageFromDB,
};
