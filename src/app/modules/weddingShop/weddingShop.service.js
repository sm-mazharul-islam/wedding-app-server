const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getWeddingShopCollection = () => getCollection("weddingShop");

const createProductInDB = async (payload) => {
  const collection = getWeddingShopCollection();
  const result = await collection.insertOne(payload);
  return result;
};

const getAllProductsFromDB = async () => {
  const collection = getWeddingShopCollection();
  const result = await collection.find({}).toArray();
  return result;
};

const getSingleProductFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getWeddingShopCollection();
  const query = { _id: new ObjectId(id) };
  const product = await collection.findOne(query);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return product;
};

const updateProductInDB = async (id, payload) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getWeddingShopCollection();
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      name: payload.name,
      priceTwo: parseFloat(payload.priceTwo),
      inStock: parseInt(payload.inStock),
    },
  };
  const result = await collection.updateOne(filter, updateDoc);
  return result;
};

const deleteProductFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getWeddingShopCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

module.exports = {
  createProductInDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateProductInDB,
  deleteProductFromDB,
};
