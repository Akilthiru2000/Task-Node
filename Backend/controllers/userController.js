const User = require("./../models/userModel");
const Task = require("../models/taskModel");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

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
    //get a jwt token and find the id
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      const error = new Error(
        err.message || "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    const adminId = decoded.id; //admin id fetch

    const user = await User.create({ ...req.body, admin_id: adminId });
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
