const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./app/errors/globalErrorHandler");
const router = require("./app/routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Application Routes
app.use("/", router);

// Root Route
app.get("/", (req, res) => {
  res.send("Wedding app server is running");
});

// Not Found Handler (404)
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    message: "API Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
