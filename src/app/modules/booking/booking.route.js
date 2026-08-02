const express = require("express");
const bookingController = require("./booking.controller");

const router = express.Router();

router.post("/bookings", bookingController.createBooking);
router.get("/my-bookings/:email", bookingController.getMyBookings);
router.get("/admin/all-bookings", bookingController.getAllBookings);
router.patch("/bookings/:id", bookingController.updateBookingStatus);
router.delete("/bookings/:id", bookingController.deleteBooking);

module.exports = router;
