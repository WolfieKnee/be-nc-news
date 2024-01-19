const { getUsers } = require("../controllers/users.controllers");
const usersRouter = require("express").Router();

usersRouter.route("/").get(getUsers);

module.exports = usersRouter;
