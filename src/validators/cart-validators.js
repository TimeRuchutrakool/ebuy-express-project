const Joi = require("joi");

const removeItemInCartSchema = Joi.object({
  cartItemId: Joi.number().integer().positive().required(),
});

exports.removeItemInCartSchema = removeItemInCartSchema;

const cartItemValidator = Joi.object({
  productId: Joi.number().integer().positive().required(),
  colorId: Joi.number().integer().positive().required(),
  shirtSizeId: Joi.number().integer().positive().allow(null, ""),
  shoeSizeId: Joi.number().integer().positive().allow(null, ""),
  pantsSizeId: Joi.number().integer().positive().allow(null, ""),
});

exports.cartItemValidator = cartItemValidator;
