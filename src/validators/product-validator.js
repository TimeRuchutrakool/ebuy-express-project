const Joi = require("joi");

checkProductSchema = Joi.object({
  sellerId: Joi.number().integer().positive().required(),
  typeId: Joi.number().integer().positive().required(),
  brandId: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  description: Joi.string().required(),
});

exports.checkProductSchema = checkProductSchema;
