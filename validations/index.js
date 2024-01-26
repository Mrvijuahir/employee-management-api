const Joi = require("joi");

module.exports = {
  signup: Joi.object().keys({
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  }),
};
