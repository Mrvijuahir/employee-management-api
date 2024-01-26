const jwt = require("jsonwebtoken");

exports.generateJWTToken = (payload = {}, expiresIn = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn });
};
