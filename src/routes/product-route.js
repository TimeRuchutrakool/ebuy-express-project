const express = require("express");
const productController = require("../controllers/product-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const uploadMiddleware = require("../middlewares/upload");
const authenticates = require("../middlewares/authenticates");
const router = express.Router();

router.post(
  "/",
  authenticatedMiddleware,
  uploadMiddleware.array("image"),
  productController.createProduct
);

router.patch(
  "/editProduct",
  authenticatedMiddleware,
  uploadMiddleware.array("image"),
  productController.updateProduct
);

router.get("/variant", authenticates, productController.getVariant);
router.get("/search/:searchedTitle", productController.search);
router.get("/productId/:productId", productController.getProductById);
router.get("/productPopular", productController.getProductPopular);
router.get("/review/:productId", productController.getReviewProduct);
router.post("/review", authenticates, productController.createReview);
router.delete(
  "/delete/:productId",
  authenticates,
  productController.deleteProduct
);


module.exports = router;
