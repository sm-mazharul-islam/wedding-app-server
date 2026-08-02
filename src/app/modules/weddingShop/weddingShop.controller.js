const catchAsync = require("../../utils/catchAsync");
const weddingShopService = require("./weddingShop.service");

const createProduct = catchAsync(async (req, res) => {
  const result = await weddingShopService.createProductInDB(req.body);
  res.send(result);
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await weddingShopService.getAllProductsFromDB();
  res.send(result);
});

const getSingleProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await weddingShopService.getSingleProductFromDB(id);
  res.status(200).send(result);
});

const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await weddingShopService.updateProductInDB(id, req.body);
  res.send(result);
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await weddingShopService.deleteProductFromDB(id);
  res.send(result);
});

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
};
