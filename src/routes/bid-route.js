const express = require("express");

const uploadMiddleware = require("../middlewares/upload");
const authenticatedMiddleware = require('../middlewares/authenticates');
const bidController =require("../controllers/bid-controller")
const router = express.Router();


router.post("/create",authenticatedMiddleware,uploadMiddleware.array("image"),bidController.createBidProducts)
router.get("/",authenticatedMiddleware,bidController.getBidProducts)
module.exports = router;