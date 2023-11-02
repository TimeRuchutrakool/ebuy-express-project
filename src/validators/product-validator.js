const Joi = require("joi");

const checkProductSchema = Joi.object({
  typeId: Joi.number().integer().positive().required(),
  brandId: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().required(),
  sizeAndStock: Joi.required().allow(""),
 
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

const checkUpdateProductSchema = Joi.object({
  typeId: Joi.number().integer().positive().optional(),
  brandId: Joi.number().integer().positive().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  name: Joi.string().optional(),
  productId : Joi.number().positive().integer(),
  price: Joi.number().positive().optional(),
  description: Joi.string().optional(),
  sizeAndStock: Joi.optional().allow(""),
});

exports.checkUpdateProductSchema = checkUpdateProductSchema;

const checkUpdateProductVariantSchema = Joi.array().items(
  Joi.object({
    colorId: Joi.number().integer().positive().optional(),
    shoeSizeId: Joi.number().integer().positive().optional(),
    shirtSizeId: Joi.number().integer().positive().optional(),
    pantsSizeId: Joi.number().integer().positive().optional(),
    stock: Joi.number().integer().positive().optional(),
  })
);

exports.checkUpdateProductVariantSchema = checkUpdateProductVariantSchema;
const checkProductIdSchema = Joi.object({
  productId : Joi.number().positive().required()
  })

exports.checkProductIdSchema = checkProductIdSchema
