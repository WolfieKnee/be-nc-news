const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const { getArticleById } = require("./controllers/articles.controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
	if (err.msg === "unable to read the endpoints file") {
		res.status(404).send({ msg: err.msg });
	} else next(err);
});

app.all("/api/*", (req, res, next) => {
	res.status(404).send({
		msg: `Not Found. ${req.originalUrl} is not a valid endpoint. Try /api/`,
	});
});

app.use((err, req, res, next) => {
	if (err.code === "22P02") {
		res.status(400).send({ msg: "Bad Request" });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	if (err.msg === "requested article does not exist") {
		res.status(404).send({ msg: "Not Found" });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	res.status(500).send({
		message: "500 error! sorry, Dr Dev made a boo-boo",
	});
});

module.exports = app;
