const Joi = require('joi');

const addWishSchema = Joi.object({
    productId : Joi.number().integer().positive().required()
});

exports.addWishSchema = addWishSchema;


