const {
  signupUser,
  loginUser,
  getUserDetail,
  getDashboard,
} = require("../controllers/user.controller");
const { validate, authenticateUser } = require("../middlewares");
const { signup, login } = require("../validations");

const router = require("express").Router();

router.get("/", authenticateUser, getUserDetail);
router.post("/signup", validate(signup), signupUser);
router.post("/login", validate(login), loginUser);
router.get("/dashboard", authenticateUser, getDashboard);

module.exports = router;
