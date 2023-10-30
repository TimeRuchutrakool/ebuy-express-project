const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
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
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};
