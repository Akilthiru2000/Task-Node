const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
      maxlength: [
        40,
        "A task Title must have less than or equal to 40 character", //max length
      ],
      minlength: [
        10,
        "A task Title must have more than or equal to 10 character", //min length
      ],
    },
    description: {
      type: String,
      required: [true, "A task must have a description"], // must have a description
    },
    priority: {
      type: String,
      required: [true, "A task must have a priority"], //must have a priority
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority is either low,medium or high",
      },
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (date) {
          return date > Date.now(); //  due date is not in the past
        },
        message: "Due date must be in the future",
      },
    },
    status: {
      type: String,
      enum: ["open", "inprogress", "rejected", "completed"],
      default: "open",
    },
    assignee: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.virtual("tasks", {
  ref: "User",
  foreignField: "tour",
  localField: "_id",
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
