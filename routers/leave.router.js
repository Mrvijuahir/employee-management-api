const {
  applyForLeave,
  updateLeave,
  takeActionOnLeave,
  deleteLeave,
  getLeaves,
} = require("../controllers/leave.controller");
const { authenticateUser } = require("../middlewares");

const router = require("express").Router();

router.get("/", authenticateUser, getLeaves);
router.post("/", authenticateUser, applyForLeave);
router.put("/:id", authenticateUser, updateLeave);
router.post("/:id", authenticateUser, takeActionOnLeave);
router.delete("/:id", authenticateUser, deleteLeave);

module.exports = router;
