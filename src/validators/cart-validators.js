const Joi = require('joi')

const removeItemInCartSchema = Joi.object({
    removeItem : Joi.number().integer().positive().required()
})

exports.removeItemInCartSchema = removeItemInCartSchema;


const addIteminCartSchema = Joi.object({
    amount : Joi.number().integer().positive().required(),
    productId : Joi.number().integer().positive().required(),
})

exports.addIteminCartSchema = addIteminCartSchema;
