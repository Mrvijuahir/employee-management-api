const { Leave, User } = require("../models/index");
const moment = require("moment");

let availableLeaves = {
  casual: "casual_leave",
  sick: "sick_leave",
};
exports.applyForLeave = async (req, res, next) => {
  try {
    const { type = "", start_date, end_date, reason } = req.body;

    let dayCount =
      moment(new Date(end_date)).diff(moment(new Date(start_date)), "days") + 1;

    if (type == "emergency") {
      await Leave.create({
        user_id: req.user.id,
        type: "emergency",
        reason,
        start_date,
        end_date,
      });
    } else {
      if (req.user?.[availableLeaves[type]] >= dayCount) {
        await Leave.create({
          user_id: req.user.id,
          type: type,
          reason,
          start_date,
          end_date,
        });
        await User.update(
          {
            [availableLeaves?.[type]]:
              req.user?.[availableLeaves[type]] - dayCount,
          },
          {
            where: {
              id: req.user?.id,
            },
          }
        );
      } else {
        return res.status(400).json({
          status: false,
          message: "You dont have enough leave available",
        });
      }
    }
    return res.status(201).json({
      status: true,
      message: "Leave applied successfully",
    });
  } catch (error) {
    console.log("applyForLeave error", error);
    next(error);
  }
};

exports.updateLeave = async (req, res, next) => {
  try {
    const { type = "", start_date, end_date, reason } = req.body;
    let { id } = req.params;

    let dayCount = moment(end_date).diff(moment(start_date), "days") + 2;

    let availableLeaves = {
      casual: "casual_leave",
      sick: "sick_leave",
    };

    let leave = await Leave.findOne({
      where: {
        id,
        user_id: req.user?.id,
        approved: false,
        declined: false,
      },
    });

    if (!leave) {
      return res.status(400).json({
        status: false,
        message: "You can not update this leave",
      });
    }

    if (leave?.type == "emergency" && type != "emergency") {
      if (req.user?.[availableLeaves[type]] >= dayCount) {
        await Leave.update(
          {
            type,
            reason,
            start_date,
            end_date,
          },
          {
            where: {
              id,
            },
          }
        );
        await User.update(
          {
            [availableLeaves?.[type]]:
              req.user?.[availableLeaves[type]] - dayCount,
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );
        return res.status(200).json({
          status: true,
          message: "Leave updated successfully",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "You do not have enough leaves",
        });
      }
    } else {
      if (leave?.type != "emergency" && type == "emergency") {
        await Leave.update(
          {
            type,
            reason,
            start_date,
            end_date,
          },
          {
            where: {
              id,
            },
          }
        );
        await User.update(
          {
            [leave?.type]:
              req.user?.[availableLeaves[type]] +
              moment(leave?.end_date).diff(moment(leave?.start_date), "days"),
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );
        return res.status(200).json({
          status: true,
          message: "Leave updated successfully",
        });
      }
    }

    await Leave.update(
      {
        type,
        reason,
        start_date,
        end_date,
      },
      {
        where: {
          id,
        },
      }
    );

    await User.update(
      {
        [leave?.type]:
          req.user?.[availableLeaves[leave?.type]] -
          moment(leave?.end_date).diff(moment(leave?.start_date), "days") +
          dayCount,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: "Leave updated successfully",
    });
  } catch (error) {
    console.log("applyForLeave error", error);
    next(error);
  }
};

exports.takeActionOnLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    if (req.user.role != "manager") {
      return res.status(400).json({
        status: false,
        message: "You can not approve leave",
      });
    }
    let leave = await Leave.findOne({
      where: {
        id,
        approved: false,
        declined: false,
      },
    });
    if (!leave) {
      return res.status(400).json({
        status: false,
        message: "Action already taken",
      });
    }

    await leave.update(
      type == "approve" ? { approved: true } : { declined: true }
    );

    return res.status(200).json({
      status: true,
      message: `Leave ${
        type == "approve" ? "approved" : "declined"
      } successfully`,
    });
  } catch (error) {
    console.log("takeActionOnLeave error", error);
    next(error);
  }
};

exports.deleteLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    let leave = await Leave.findOne({
      where: {
        id,
        user_id: req.user.id,
        approved: false,
        declined: false,
      },
    });
    if (!leave) {
      return res.status(400).json({
        status: false,
        message: "You can not delete this leave",
      });
    }

    await leave.destroy();

    await User.update(
      {
        [availableLeaves?.[leave?.type]]:
          req.user?.[availableLeaves[leave?.type]] + 1,
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: `Leave deleted successfully`,
    });
  } catch (error) {
    console.log("takeActionOnLeave error", error);
    next(error);
  }
};

exports.getLeaves = async (req, res, next) => {
  try {
    let where = {};

    if (req.user.role == "manager") {
    } else {
      where = {
        ...where,
        user_id: req.user.id,
      };
    }

    let leaves = await Leave.findAndCountAll({
      where: where,
      order: [["created_at", "desc"]],
      ...(req.user.role == "manager" && {
        include: [
          {
            model: User,
          },
        ],
      }),
    });

    return res.status(200).json({
      status: true,
      data: leaves,
    });
  } catch (error) {
    console.log("getLeaves error", error);
    next(error);
  }
};
