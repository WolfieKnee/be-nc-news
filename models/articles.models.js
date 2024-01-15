const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
	console.log(article_id, "<< article_id in model");

	return db
		.query(
			`SELECT * FROM articles
                WHERE article_id = $1`,
			[article_id]
		)
		.then((results) => {
			return results.rows[0];
		});
};
