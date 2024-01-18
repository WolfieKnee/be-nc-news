const { checkArticleExists } = require("./models.utils");
const db = require("../db/connection");

exports.fetchCommentsByArticleId = (article_id) => {
	const fetchCommentsQuery = db.query(
		`SELECT * FROM comments
			WHERE article_id = $1
			ORDER BY created_at DESC`,
		[article_id]
	);
	const articleExistsQuery = checkArticleExists(article_id);
	return Promise.all([fetchCommentsQuery, articleExistsQuery]).then(
		(resolvedPromises) => {
			const results = resolvedPromises[0];
			return results.rows;
		}
	);
};

exports.insertCommentByArticleId = (article_id, newComment) => {
	return db
		.query(
			`INSERT INTO comments
		(author, body, article_id)
		VALUES($1, $2, $3)
		RETURNING *`,
			[newComment.username, newComment.body, article_id]
		)
		.then((result) => {
			return result.rows[0];
		});
};

exports.removeCommentById = (comment_id) => {
	return db
		.query(
			`DELETE FROM comments
		WHERE comment_id = $1
		RETURNING *`,
			[comment_id]
		)
		.then((result) => {
			if (result.rows.length === 0) {
				return Promise.reject({ msg: "no such comment" });
			}
		});
};
