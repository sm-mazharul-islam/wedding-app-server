const catchAsync = require("../../utils/catchAsync");
const bookingService = require("./booking.service");

const createBooking = catchAsync(async (req, res) => {
  const result = await bookingService.createBookingInDB(req.body);
  res.send(result);
});

const getMyBookings = catchAsync(async (req, res) => {
  const { email } = req.params;
  const result = await bookingService.getMyBookingsFromDB(email);
  res.send(result);
});

const getAllBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getAllBookingsFromDB();
  res.send(result);
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await bookingService.updateBookingStatusInDB(id, status);
  res.send(result);
});

const deleteBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await bookingService.deleteBookingFromDB(id);
  res.send(result);
});

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};
