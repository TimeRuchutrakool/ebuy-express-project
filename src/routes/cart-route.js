const express = require('express');
const authenticatedMiddleware = require("../middlewares/authenticates")
const cartController = require("../controllers/cart-controller")
const router = express.Router();

// router.post("/addCart",authenticatedMiddleware,cartController.addCartItems);
router.post("/addCart",authenticatedMiddleware,cartController.addCartItems)


module.exports = router;