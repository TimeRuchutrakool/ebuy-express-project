const { loginSchema, registerSchema } = require("../validators/auth-validator");
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    value.password = await bcrypt.hash(value.password, 12);
    const user = await prisma.user.create({
      data: value,
      select : {
        profileImage : "https://res.cloudinary.com/db3ltztig/image/upload/v1699439097/w5rtm4xqqbt584nooq7g.jpg"
      }
    });

    const payload = { userId: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "asldkfn82ksdfosajdla;klsd",
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );
    await prisma.address.create({
      data: {
        userId: user.id,
      },
    });
    delete user.password;
    res.status(201).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const user = await prisma.user.findFirst({
      where: {
        email: value.email,
      },
    });
    if (!user) {
      return next(createError("invalid credential", 400));
    }

    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return next(createError("invalid credential", 400));
    }

    const payload = { userId: user.id };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "dfkjianeiwnxcvlsc",
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );
    delete user.password;
    res.status(201).json({ accessToken, user });
  } catch (error) {
    console.log(
      "🚀 ~ file: auth-controller.js:64 ~ exports.login= ~ error:",
      error
    );
    next(error);
  }
};

exports.getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};
