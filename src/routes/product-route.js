const express = require("express");
const productController = require("../controllers/product-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const uploadMiddleware = require("../middlewares/upload");
const router = express.Router();

router.post("/",authenticatedMiddleware,uploadMiddleware.array("image"),productController.createProduct);
router.patch('/editProduct/:id',authenticatedMiddleware,uploadMiddleware.array("image"),productController.editProduct)

module.exports = router;
