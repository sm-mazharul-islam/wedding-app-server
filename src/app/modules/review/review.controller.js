const catchAsync = require("../../utils/catchAsync");
const reviewService = require("./review.service");

const createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReviewInDB(req.body);
  res.send(result);
});

const getAllReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getAllReviewsFromDB();
  res.send(result);
});

const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await reviewService.deleteReviewFromDB(id);
  res.send(result);
});

const pinReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;
  const result = await reviewService.pinReviewInDB(id, isPinned);
  res.send(result);
});

const getPinnedReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getPinnedReviewsFromDB();
  res.send(result);
});

module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  pinReview,
  getPinnedReviews,
};
