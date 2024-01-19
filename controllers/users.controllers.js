const { fetchUsers, fetchUserByUsername } = require("../models/users.models");

exports.getUsers = (req, res) => {
	fetchUsers().then((users) => {
		return res.status(200).send({ users });
	});
};

exports.getUserByUsername = (req, res) => {
	const { username } = req.params;
	fetchUserByUsername(username).then((user) => {
		return res.status(200).send({ user });
	});
};
