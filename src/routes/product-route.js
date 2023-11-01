const express = require("express");
const productController = require("../controllers/product-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const uploadMiddleware = require("../middlewares/upload");
const router = express.Router();

router.post(
  "/",
  authenticatedMiddleware,
  uploadMiddleware.array("image"),
  productController.createProduct
);
router.get("/searchedTitle/:searchedTitle",productController.searchProduct)

module.exports = router;
