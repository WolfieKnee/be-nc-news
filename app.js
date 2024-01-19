const express = require("express");

const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require("./errors");

const apiRouter = require("./routes/api-router");

const app = express();

app.use(express.json());
app.use("/api", apiRouter);

module.exports = app;
