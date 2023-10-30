const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const { checkProductSchema } = require("../validators/product-validator");

exports.createProduct = async (req, res, next) => {
  try {
    req.body.sellerId = +req.user.id;

    const { value, error } = checkProductSchema.validate(req.body);
    if (error) {
      return next(createError("Incorrect information", 400));
    }
    const product = await prisma.product.create({
      data: value,
    });

    if (!req.files) {
      next(createError("product image is required", 400));
    }

    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const url = await upload(path);
      urls.push(url);
      fs.unlink(path);
    }

    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, productId: product.id });
    }

    await prisma.productImage.createMany({
      data: images,
    });

    res.status(201).json({ data: { product, images } });
  } catch (err) {
    next(err);
  }
};
