const { fetchUsers } = require("../models/users.models");

exports.getUsers = (req, res) => {
	fetchUsers().then((users) => {
		return res.status(200).send({ users });
	});
};
