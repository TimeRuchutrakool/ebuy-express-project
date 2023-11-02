const Joi = require("joi");

const checkProductSchema = Joi.object({
  typeId: Joi.number().integer().positive().required(),
  brandId: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().required(),
  sizeAndStock: Joi.string().required(),
});

exports.checkProductSchema = checkProductSchema;

const checkProductVariantSchema = Joi.array().items(
  Joi.object({
    colorId: Joi.number().integer().positive().required(),
    shoeSizeId: Joi.number().integer().positive().optional(),
    shirtSizeId: Joi.number().integer().positive().optional(),
    pantSizeId: Joi.number().integer().positive().optional(),
    stock: Joi.number().integer().positive().required(),
  })
);

exports.checkProductVariantSchema = checkProductVariantSchema;

const checkProductIdSchema = Joi.object({
  productId : Joi.number().positive().required()
  })

exports.checkProductIdSchema = checkProductIdSchema