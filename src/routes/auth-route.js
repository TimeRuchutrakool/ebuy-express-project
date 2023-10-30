const express = require("express");
const authController = require("../controllers/auth-controller");
const authenticatedMiddleware = require('../middlewares/authenticates');
const router = express.Router();


router.post("/login", authController.login);
router.post("/register", authController.register);
router.get('/me',authenticatedMiddleware,authController.getMe)


module.exports = router;
