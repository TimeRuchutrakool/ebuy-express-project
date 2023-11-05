const express = require("express");
const authenticatedMiddleware = require("../middlewares/authenticates");
const wishController = require("../controllers/wish-Controller");
const router = express.Router();

router.get("/", authenticatedMiddleware, wishController.getWish);
router.post("/toggleWish/:productId", authenticatedMiddleware, wishController.toggleWish);
router.get("/isWish", authenticatedMiddleware, wishController.isWish);

module.exports = router;
