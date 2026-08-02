const { getCollection } = require("../../config/db");

const getOrdersCollection = () => getCollection("orders");

const createOrderInDB = async (payload) => {
  const collection = getOrdersCollection();
  const result = await collection.insertOne(payload);
  return result;
};

module.exports = {
  createOrderInDB,
};
