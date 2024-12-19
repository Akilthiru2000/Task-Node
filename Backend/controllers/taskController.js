const Task = require("./../models/taskModel");
const sendEmail = require("../email");
const User = require("./../models/userModel");

exports.getAllTask = async (req, res, next) => {
  try {
    //get all task by admin
    const tasks = await Task.find()
      .populate("assignee", "name")
      .sort({ dueDate: 1 });
    res.status(200).json({
      status: "success",
      results: tasks.length,
      data: {
        tasks,
      },
    });
    // console.log(tasks);
    next();
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    // Create task by admin
    const task = await Task.create(req.body);

    if (req.body.assignee) {
      const assignee = await User.findById(req.body.assignee);

      if (assignee) {
        const message = `A new task has been assigned to you:\n\nTask Title: ${
          task.title || "Untitled Task"
        }\nDescription: ${task.description || "No description provided"}`;

        await sendEmail({
          email: assignee.email,
          subject: "New Task Assignment",
          message,
        });
      }
    }

    res.status(201).json({
      status: "success",
      data: {
        data: task,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Failed to create task");
    error.statusCode = err.name === "ValidationError" ? 400 : 500;
    next(error);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error = new Error("No Task found with that ID");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new Error("Task ID is required"));
    }

    // Update task by the admin
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      const error = new Error("No Task found with that ID");
      error.statusCode = 404;
      return next(error);
    }

    if (req.body.assignee) {
      try {
        const assignee = await User.findById(req.body.assignee);

        if (assignee) {
          const message = `A task has been updated and assigned to you:\n\nTask Title: ${task.title}\nDescription: ${task.description}`;

          await sendEmail({
            email: assignee.email,
            subject: "Update Task Assignment",
            message,
          });
        }
      } catch (assigneeError) {
        console.error(
          "Failed to process assignee notification:",
          assigneeError
        );
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        task,
      },
    });
  } catch (err) {
    console.error("Task update error:", err);

    const error = new Error(err.message || "Server error");
    error.statusCode = err.name === "ValidationError" ? 400 : 500;
    next(error);
  }
};
exports.deleteTask = async (req, res, next) => {
  try {
    //delete the task by the admin
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      const error = new Error("No Task found with that ID");
      error.statusCode = 404;
      return next(error);
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    const error = new Error(err.message || "Server error");
    error.statusCode = 404;
    next(error);
  }
};
