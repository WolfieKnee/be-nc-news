const apiRouter = require("express").Router();

const { getEndpoints } = require("../controllers/api.controllers");

const commentsRouter = require("./comments-route");
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");
const articlesRouter = require("./articles-router");
const {
	handleBadEndpoint,
	handleCustomErrors,
	handlePsqlErrors,
	handleServerErrors,
} = require("../errors");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/articles", articlesRouter);

apiRouter.all("/*", handleBadEndpoint);

apiRouter.use(handleCustomErrors);
apiRouter.use(handlePsqlErrors);
apiRouter.use(handleServerErrors);

module.exports = apiRouter;
