const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getEndpoints } = require("./controllers/api.controllers");

const app = express();

// TODO: when receiving a json body from the client, e.g. POST express.json()

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

// ERROR HANDLING
app.use((err, req, res, next) => {
	// handle error if endpoint.json file is missing. Cannot test for this as the filename is not given as part of endpoint, but manually confirmed in development with malformed path.
	if (err.msg === "unable to read the endpoints file") {
		console.log(err, "<< err in app");
		res.status(404).send({ msg: err.msg });
	} else next(err);
});

// more verbose 500
app.use((err, req, res, next) => {
	console.log(err, "<< err in app");
	res.status(500).send({
		message: "500 error! sorry, Dr Dev made a boo-boo",
	});
});

module.exports = app;
