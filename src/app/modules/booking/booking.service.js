const { ObjectId } = require("mongodb");
const { getCollection } = require("../../config/db");
const AppError = require("../../errors/AppError");

const getBookingCollection = () => getCollection("bookings");

const createBookingInDB = async (payload) => {
  const collection = getBookingCollection();
  const bookingData = {
    ...payload,
    status: "Pending",
    bookingDate: new Date(),
  };
  const result = await collection.insertOne(bookingData);
  return result;
};

const getMyBookingsFromDB = async (userEmail) => {
  const collection = getBookingCollection();
  const result = await collection.find({ userEmail }).toArray();
  return result;
};

const getAllBookingsFromDB = async () => {
  const collection = getBookingCollection();
  const result = await collection.find().toArray();
  return result;
};

const updateBookingStatusInDB = async (id, status) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getBookingCollection();
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = { $set: { status } };
  const result = await collection.updateOne(filter, updatedDoc);
  return result;
};

const deleteBookingFromDB = async (id) => {
  if (!ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID format");
  }
  const collection = getBookingCollection();
  const query = { _id: new ObjectId(id) };
  const result = await collection.deleteOne(query);
  return result;
};

module.exports = {
  createBookingInDB,
  getMyBookingsFromDB,
  getAllBookingsFromDB,
  updateBookingStatusInDB,
  deleteBookingFromDB,
};
