const express = require("express");
const reviewController = require("./review.controller");

const router = express.Router();

router.post("/reviews", reviewController.createReview);
router.get("/reviews", reviewController.getAllReviews);
router.delete("/reviews/:id", reviewController.deleteReview);
router.patch("/reviews/pin/:id", reviewController.pinReview);
router.get("/reviews/pinned", reviewController.getPinnedReviews);

module.exports = router;
