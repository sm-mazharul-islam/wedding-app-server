const { getCollection } = require("../../config/db");

const getCartCollection = () => getCollection("cart");

const saveOrUpdateCartInDB = async (payload) => {
  const { email, cartItems } = payload;
  const collection = getCartCollection();
  const query = { email };
  const updateDoc = {
    $set: {
      email,
      cartItems,
      lastUpdated: new Date(),
    },
  };
  const options = { upsert: true };
  const result = await collection.updateOne(query, updateDoc, options);
  return result;
};

const getUserCartFromDB = async (email) => {
  const collection = getCartCollection();
  const result = await collection.findOne({ email });
  return result || { cartItems: [] };
};

module.exports = {
  saveOrUpdateCartInDB,
  getUserCartFromDB,
};
