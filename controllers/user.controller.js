const { Op } = require("sequelize");
const { generateJWTToken } = require("../helpers");
const { User, sequelize, Leave } = require("../models/index");
const bcrypt = require("bcryptjs");

exports.signupUser = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    let isUserExist = await User.findOne({
      where: {
        email: email,
      },
    });

    if (isUserExist) {
      return res.status(422).json({
        status: false,
        message: "User already exists with same email",
      });
    }

    let createdUser = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: true,
      message: "User created successfully.",
      data: {
        token: generateJWTToken({ id: createdUser?.id }),
      },
    });
  } catch (error) {
    console.log("signup error", error);
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(422).json({
        status: false,
        message: "User not exists with this email",
      });
    }

    if (!bcrypt.compareSync(password, user?.password)) {
      return res.status(422).json({
        status: false,
        message: "Password does not match",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User loggedin successfully.",
      data: {
        token: generateJWTToken({ id: user?.id }),
      },
    });
  } catch (error) {
    console.log("login error", error);
    next(error);
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: true,
      message: "User details fetched successfully.",
      data: req.user,
    });
  } catch (error) {
    console.log("getUserDetail error", error);
    next(error);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    if (req.user.role == "manager") {
      let [pending, approved, declined] = await Promise.all([
        await Leave.count({
          where: {
            approved: false,
            declined: false,
          },
        }),
        await Leave.count({
          where: {
            approved: true,
          },
        }),
        await Leave.count({
          where: {
            declined: true,
          },
        }),
      ]);
      return res.status(200).json({
        status: true,
        message: "Dashboard data fetched",
        data: {
          pending,
          approved,
          declined,
        },
      });
    } else {
      let [user, applied] = await Promise.all([
        await User.findOne({
          where: {
            id: req.user.id,
          },
        }),
        await Leave.count({
          where: {
            user_id: req.user.id,
            declined: false,
            type: {
              [Op.not]: "emergency",
            },
          },
        }),
      ]);

      return res.status(200).json({
        status: true,
        message: "Dashboard data fetched",
        data: {
          total: 18,
          applied,
          available: 18 - applied,
        },
      });
    }
  } catch (error) {
    console.error("getDashboard error", error);
    next();
  }
};
