const express = require("express");

const uploadMiddleware = require("../middlewares/upload");
const authenticatedMiddleware = require("../middlewares/authenticates");
const bidController = require("../controllers/bid-controller");
const router = express.Router();

router.post(
  "/create",
  authenticatedMiddleware,
  uploadMiddleware.array("image"),
  bidController.createBidProducts
);
router.get("/bidProductId/:bidProductId", bidController.getBidProductsById);
router.get("/", bidController.getBidProducts);
router.patch(
  "/addBidProdToStripe",
  authenticatedMiddleware,
  bidController.addBidProductToStripe
);
router.post("/checkout", authenticatedMiddleware, bidController.bidCheckout);
module.exports = router;
