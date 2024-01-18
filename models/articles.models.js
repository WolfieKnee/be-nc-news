const db = require("../db/connection");
exports.fetchArticleById = (article_id) => {
	return db
		.query(
			`SELECT articles.*, 
			COUNT(comments.comment_id) AS comment_count 
			FROM articles LEFT OUTER JOIN comments 
			ON comments.article_id = articles.article_id
			WHERE articles.article_id = $1
			GROUP BY articles.article_id`,
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

exports.fetchArticles = (topic) => {
	const queryValues = [];
	let queryStr = `SELECT articles.*, COUNT(comments.comment_id) 
	AS comment_count FROM articles LEFT OUTER JOIN comments 
	ON comments.article_id = articles.article_id`;
	if (topic) {
		queryValues.push(topic);
		queryStr += ` WHERE topic = $1`;
	}
	queryStr += ` GROUP BY articles.article_id ORDER BY created_at DESC`;
	return db.query(queryStr, queryValues).then((results) => {
		return results.rows;
	});
};

exports.updateArticleByArticleId = (article_id, newVote) => {
	return db
		.query(
			`UPDATE articles
			SET votes = votes + $1
			WHERE article_id = $2
			RETURNING *`,
			[newVote, article_id]
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
