const User = require("./../models/userModel");
const Task = require("../models/taskModel");

exports.getAllUser = async (req, res, next) => {
  try {
    //get all user by admin
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error("No User found with that ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};
