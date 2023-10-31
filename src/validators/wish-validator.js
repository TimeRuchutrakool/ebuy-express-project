const Joi = require('joi');

const addWishSchema = Joi.object({
    addWish : Joi.number().integer().positive().required()
});

exports.addWishSchema = addWishSchema;

const removeWishSchema = Joi.object({
    addWish : Joi.number().integer().positive().required()
});

exports.removeWishSchema = removeWishSchema;

