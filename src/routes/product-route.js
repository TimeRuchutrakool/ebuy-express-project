const express = require("express");
const productController = require("../controllers/product-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const uploadMiddleware = require("../middlewares/upload");
const router = express.Router();

router.post("/",authenticatedMiddleware,uploadMiddleware.array("image"),productController.createProduct);
router.patch('/editProduct',authenticatedMiddleware,uploadMiddleware.array("image"),productController.updateProduct)


router.get("/searchedTitle/:searchedTitle",productController.searchProduct)
router.get("/productId/:productId",productController.getProductById)
router.get("/productPopular",productController.getProductPopular)
module.exports = router;
