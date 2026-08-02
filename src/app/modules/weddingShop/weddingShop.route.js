const express = require("express");
const weddingShopController = require("./weddingShop.controller");

const router = express.Router();

router.post("/weddingShop", weddingShopController.createProduct);
router.get("/weddingShop", weddingShopController.getAllProducts);
router.get("/weddingShop/:id", weddingShopController.getSingleProduct);
router.put("/weddingShop/:id", weddingShopController.updateProduct);
router.delete("/weddingShop/:id", weddingShopController.deleteProduct);

module.exports = router;
