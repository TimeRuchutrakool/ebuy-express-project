const express = require("express");

const userController = require("../controllers/user-controller")
const authenticatedMiddleware = require('../middlewares/authenticates');
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch('/editProfile',authenticatedMiddleware,userController.editProfile)
router.patch('/editProflieImage',authenticatedMiddleware,uploadMiddleware.single("profileImage"),userController.updateProfileImage)
router.patch('/editAddress',authenticatedMiddleware,userController.editAddress)
module.exports =router