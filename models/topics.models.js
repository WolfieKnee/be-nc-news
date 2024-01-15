const db = require("../db/connection");

exports.fetchTopics = () => {
	return db.query(`SELECT * FROM topics`).then((result) => {
		return result.rows;
	});

	// return Promise.reject({ message: "rejected Promise from model" });
};
