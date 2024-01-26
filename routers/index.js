const router = require("express").Router();

router.use("/user", require("./user.router"));
router.use("/leave", require("./leave.router"));

module.exports = router;
