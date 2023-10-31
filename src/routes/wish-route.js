const express = require('express');
const authenticatedMiddleware = require('../middlewares/authenticates');
const wishController = require('../controllers/wish-Controller')
const router = express.Router();


router.get("/",authenticatedMiddleware,wishController.getWish);
router.post("/:addWish",authenticatedMiddleware,wishController.addWish);

module.exports = router;