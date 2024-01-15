const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const app = express();

// TODO: when receiving a json body from the client, e.g. POST express.json()

app.get("/api/topics", getTopics);

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).send({
		message: "500 error! sorry, Dr Dev made a boo-boo",
	});
});

module.exports = app;
