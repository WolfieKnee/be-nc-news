const db = require("../db/connection");

exports.checkArticleExists = (article_id) => {
	return db
		.query(
			`SELECT * FROM articles
			WHERE article_id = $1`,
			[article_id]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested article does not exist",
				});
			}
		});
};

exports.checkTopicExists = (topic_slug) => {
	return db
		.query(
			`SELECT * FROM topics
			WHERE slug = $1`,
			[topic_slug]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested article does not exist",
				});
			}
		});
};
