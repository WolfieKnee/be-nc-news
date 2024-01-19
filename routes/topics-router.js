const { getTopics } = require("../controllers/topics.controllers");

const topicsRouter = require("express").Router();

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
