const express = require('express');
const authenticatedMiddleware = require("../middlewares/authenticates")
const cartController = require("../controllers/cart-controller")
const router = express.Router();


router.get('/',authenticatedMiddleware,cartController.getCartItem)
router.post("/addCart",authenticatedMiddleware,cartController.addCartItems)
router.delete('/:removeItem',authenticatedMiddleware,cartController.removeItem)


module.exports = router;