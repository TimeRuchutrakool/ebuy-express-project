const Joi = require('joi')

removeItemInCartSchema = Joi.object({
    removeItem : Joi.number().integer().positive().required()
})

exports.removeItemInCartSchema = removeItemInCartSchema;