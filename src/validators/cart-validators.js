const Joi = require('joi')

const removeItemInCartSchema = Joi.object({
    removeItem : Joi.number().integer().positive().required()
})

exports.removeItemInCartSchema = removeItemInCartSchema;


const addIteminCartSchema = Joi.object({
    amount : Joi.number().integer().positive().required(),
    productId : Joi.number().integer().positive().required(),
    colorId : Joi.number().integer().positive().required(),
    shirtSizeId : Joi.number().integer().positive().allow(null,''),
    shoeId : Joi.number().integer().positive().allow(null,''),
    pantSizeId : Joi.number().integer().positive().allow(null,'')
})

exports.addIteminCartSchema = addIteminCartSchema;
