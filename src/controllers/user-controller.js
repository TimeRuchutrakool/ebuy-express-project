const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinaryServices");
const fs = require("fs/promises");
const createError = require("../utils/create-error");

exports.updateProfileImage = async (req, res, next) => {
  try {
    const user = req.user;
    if (!req.file) {
      return next(createError("profile image image is required"));
    }
    console.log(req.file);
    const updateImage = {};
    if (req.file) {
      const url = await upload(req.file.path);
      updateImage.profileImage = url;
      await prisma.user.update({
        data: {
          profileImage: url,
        },
        where: {
          id: user.id,
        },
      });
    }
    res.status(200).json(updateImage);
  } catch (error) {
    next(error);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.editProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const updateInfo = req.body;
    const userData = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateInfo,
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
      },
    });

    res.status(200).json({ userData });
  } catch (error) {
    next(error);
  }
};

exports.editAddress = async (req, res, next) => {
  try {
    const { id } = req.user;
    const obj = req.body;
    const updatedAddress = await prisma.address.updateMany({
      where: {
        userId: id,
      },
      data: { ...obj },
    });
    console.log(updatedAddress);
    res.json({ updatedAddress });
  } catch (error) {
    next(error);
  }
};
