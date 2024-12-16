const express = require("express");
const taskRouter = require("./routes/taskRoutes");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const twilioRouter = require("./routes/twilioRoutes");
const app = express();

app.use(express.json());

// Cors Config
app.use(
  cors({
    origin: ["http://127.0.0.1:8080"], //front end url
    credentials: true, // Allow cookies to be included
  })
);

app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

// User and task routes
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/user", twilioRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.log("inside the error handler");
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    status: "fail",
    message: message,
  });
});

module.exports = app;
