const Joi = require("joi");

checkProductSchema = Joi.object({
  typeId: Joi.number().integer().positive().required(),
  brandId: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().required(),
  sizeAndStock: Joi.required().allow(""),
  productImgae: Joi.required()
});

exports.checkProductSchema = checkProductSchema;

checkProductVariantSchema = Joi.array().items(
  Joi.object({
    colorId: Joi.number().integer().positive().required(),
    shoeSizeId: Joi.number().integer().positive().optional(),
    shirtSizeId: Joi.number().integer().positive().optional(),
    pantSizeId: Joi.number().integer().positive().optional(),
    stock: Joi.number().integer().positive().required(),
  })
);

exports.checkProductVariantSchema = checkProductVariantSchema;

const checkProductForEdit = Joi.object({
  id : Joi.number().integer().positive().required()
})

exports.checkProductForEdit = checkProductForEdit;
