const db = require("../db/connection");

exports.fetchUsers = () => {
	return db.query(`SELECT * FROM users`).then((results) => {
		return results.rows;
	});
};
