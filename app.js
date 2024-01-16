const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const {
	getArticleById,
	getArticles,
} = require("./controllers/articles.controllers");
const {
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
	handleBadEndpoint,
} = require("./errors");

const app = express();

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);

app.all("/api/*", handleBadEndpoint);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;
