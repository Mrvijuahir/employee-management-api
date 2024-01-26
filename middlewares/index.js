const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

exports.authenticateUser = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

      if (!payload || !payload?.id) {
        return res.status(401).json({
          status: false,
          message: "Invalid token! Please login again!",
        });
      }

      let user = await User.findByPk(payload?.id, {
        attributes: {
          exclude: ["password"],
        },
      });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Authentication failed. No user found.",
        });
      }
      user = user.toJSON();
      req.user = user;
      next();
    }
    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "No token in authorization header." });
    }
  } catch (error) {
    console.log("authenticateUser error", error);
    next(error);
  }
};

exports.validate = (schema) => (req, res, next) => {
  try {
    const result = schema.validate(req.body, {
      abortEarly: false,
      errors: {
        wrap: {
          label: "",
        },
      },
    });
    if (result?.error?.details?.length) {
      return res.status(422).json({
        status: false,
        message: "Please enter valid data.",
        errors: result?.error?.details?.map((item) => ({
          key: item?.context?.key,
          message: item?.message,
        })),
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};
