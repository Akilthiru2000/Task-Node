const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const Task = require("./../models/taskModel");
const { promisify } = require("util");

const signToken = (id) => {
  //create  a token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  //send token
  const token = signToken(user._id);
  //create cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  if (user.role === "admin") {
    res.cookie("jwt_admin", token, cookieOptions);
  } else {
    res.cookie("jwt_user", token, cookieOptions);
  }

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    //login to email and password
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required!");
      error.statusCode = 400;
      next(error);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      const error = new Error("Incorrect email or password!");
      error.statusCode = 401;
      next(error);
    }

    createSendToken(user, 200, res);
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};

exports.logout = (req, res) => {
  //clear the cookie from logout
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ status: "success" });
};

exports.getTasksByUser = async (req, res, next) => {
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
        "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.id; //user id fetch

    const { page = 1, limit = 10, status = "", priority = "" } = req.query;

    const filterQuery = {
      assignee: userId,
      ...(status && { status }),
      ...(priority && { priority }),
    };

    const tasks = await Task.find(filterQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalTasks = await Task.countDocuments(filterQuery);

    res.status(200).json({
      message: "Tasks successfully",
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
      totalTasks: totalTasks,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    //update the task by the user
    const { status } = req.body;
    const taskId = req.params.id;
    // console.log(taskId);
    const allowedStatuses = ["open", "inprogress", "completed", "rejected"];
    if (!allowedStatuses.includes(status)) {
      const error = new Error("Invalid status value");
      error.statusCode = 400;
      return next(error);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: "Task status updated successfully", task });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};

exports.getUserByAdmin = async (req, res, next) => {
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
        "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const adminId = decoded.id; //admin id fetch

    const users = await User.find({ admin_id: adminId });
    // console.log(users);

    res.status(200).json({
      message: "Users fetched successfully",
      totalusers: users.length,
      data: users,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};

exports.gettaskByadmin = async (req, res, next) => {
  try {
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
        "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      return next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const adminId = decoded.id; // admin id fetch

    const users = await User.find({ admin_id: adminId });

    let allTasks = [];
    for (const user of users) {
      const tasks = await Task.find({ assignee: user._id })
        .populate("assignee", "name")
        .sort({ dueDate: 1 });

      allTasks = allTasks.concat(tasks);
    }

    res.status(200).json({
      status: "success",
      results: allTasks.length,
      data: {
        tasks: allTasks,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    return next(error);
  }
};

exports.getClaimUser = async (req, res, next) => {
  try {
    // console.log("inside the claim");
    const users = await User.find({ admin_id: null, role: { $ne: "admin" } });
    // console.log(users);
    res.status(200).json({
      message: "Users fetched successfully",
      totalusers: users.length,
      data: users,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    return next(error);
  }
};

exports.unmapUserFromAdmin = async (req, res, next) => {
  try {
    // console.log("inside the unmap");
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
        "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      return next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const adminId = decoded.id; // admin id fetch
    // console.log(req.params.id);
    const userId = req.params.id;
    // console.log(userId);

    if (!userId) {
      const error = new Error("User ID is required.");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ _id: userId, admin_id: adminId });
    if (!user) {
      return res.status(404).json({
        message: "No user found or user not associated with this admin.",
      });
    }

    const tasksInProgress = await Task.find({
      assignee: userId,
      status: ["inprogress", "open"],
    });
    // console.log(tasksInProgress);
    if (tasksInProgress.length > 0) {
      return res.status(400).json({
        message:
          "User cannot be unmapped from admin as they have tasks open or in progress.",
      });
    }

    user.admin_id = null;
    await user.save();

    return res.status(200).json({
      message: "User successfully unmapped from admin.",
      user: user,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};

exports.mapUserToAdmin = async (req, res, next) => {
  try {
    // console.log("inside the map");

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
        "You are not logged in! Please log in to get access."
      );
      error.statusCode = 401;
      return next(error);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const adminId = decoded.id; // admin id fetch
    // console.log(req.params.id);
    const userId = req.params.id;
    // console.log(userId);

    if (!userId) {
      const error = new Error("User ID is required.");
      error.statusCode = 400;
      return next(error);
    }

    const alreadymap = await User.findOne({ _id: userId, admin_id: adminId });

    if (alreadymap) {
      return res.status(400).json({
        message: "User is already mapped to this admin.",
      });
    }
    const mapOtherAdmin = await User.findOne({
      _id: userId,
      admin_id: { $ne: null },
    });

    if (mapOtherAdmin) {
      return res.status(400).json({
        message: "This user is already mapped to another admin.",
      });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.admin_id = adminId;
    await user.save();

    return res.status(200).json({
      message: "User successfully mapped to admin.",
      user: user,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 500;
    next(error);
  }
};
