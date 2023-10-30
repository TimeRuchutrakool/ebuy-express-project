const express = require("express");
const productController = require("../controllers/product-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const router = express.Router();

router.post("/", authenticatedMiddleware, productController.createProduct);

module.exports = router;
