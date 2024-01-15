const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const app = express();

// TODO: when receiving a json body from the client, e.g. POST express.json()

app.get("/api/topics", getTopics);

module.exports = app;
