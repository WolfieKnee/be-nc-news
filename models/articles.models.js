const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
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
			} else {
				return results.rows[0];
			}
		});
};

exports.fetchArticles = () => {
	return db
		.query(
			`SELECT * FROM articles
		ORDER BY created_at DESC`
		)
		.then((results) => {
			return results.rows;
		});
};
