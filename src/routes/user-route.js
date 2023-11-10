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
module.exports = router;
