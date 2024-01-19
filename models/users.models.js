const db = require("../db/connection");

exports.fetchUsers = () => {
	return db.query(`SELECT * FROM users`).then((results) => {
		return results.rows;
	});
};

exports.fetchUserByUsername = (username) => {
	return db
		.query(
			`SELECT username, avatar_url, name FROM users
	WHERE username = $1`,
			[username]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested user does not exist",
				});
			} else {
				return results.rows[0];
			}
		});
};
