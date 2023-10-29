const Joi = require("joi");

registerSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .trim()
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
  address: Joi.string().trim().optional(),
});

exports.registerSchema = registerSchema;

loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.loginSchema = loginSchema;
