const express = require("express");

const userController = require("../controllers/user-controller");
const authenticatedMiddleware = require("../middlewares/authenticates");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch(
  "/editProfile",
  authenticatedMiddleware,
  userController.editProfile
);
router.patch(
  "/editProflieImage",
  authenticatedMiddleware,
  uploadMiddleware.single("profileImage"),
  userController.updateProfileImage
);
router.get("/mystore", authenticatedMiddleware, userController.getMystore);
router.get(
  "/myBidProduct",
  authenticatedMiddleware,
  userController.getMyBidProducts
);
router.patch(
  "/editAddress",
  authenticatedMiddleware,
  userController.editAddress
);

router.get("/editProductById/:productId",authenticatedMiddleware,userController.getEditProductById)
router.get("/myOrder",authenticatedMiddleware,userController.getMyorder)
router.patch("/track",authenticatedMiddleware,userController.confirmTrack)
router.patch("/confirmReceipt",authenticatedMiddleware,userController.confirmReceipt)
router.get("/mySale",authenticatedMiddleware,userController.getMySale)
router.get("/myHistory",authenticatedMiddleware,userController.getMyHistory)
module.exports = router;
