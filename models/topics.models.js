const db = require("../db/connection");

exports.fetchTopics = () => {
	return db.query(`SELECT * FROM topics`).then((result) => {
		return result.rows;
	});
};

exports.insertTopic = (newTopic) => {
	return db
		.query(
			`INSERT INTO topics
	(slug, description)
	VALUES ($1, $2) 
	RETURNING *`,
			[newTopic.slug, newTopic.description]
		)
		.then((results) => {
			return results.rows[0];
		});
};
