const { checkArticleExists } = require("./models.utils");
const db = require("../db/connection");

exports.fetchCommentsByArticleId = (article_id, limit, page) => {
	if ((limit && !Number(limit)) || (page && !Number(page))) {
		return Promise.reject({ msg: "invalid pagination query" });
	}

	let queryStr = `SELECT * FROM comments
			WHERE article_id = $1
			ORDER BY created_at DESC`;
	const queryValues = [article_id];

	if (limit) {
		queryStr += ` LIMIT ${limit} `;
		if (page) {
			queryStr += ` OFFSET ${page * limit - limit} `;
		}
	}
	const fetchCommentsQuery = db.query(queryStr, queryValues);
	const articleExistsQuery = checkArticleExists(article_id);
	const queries = [fetchCommentsQuery];

	if (limit) {
		const totalCountQuery = db.query(
			`SELECT count(*) FROM comments WHERE article_id = $1`,
			[article_id]
		);
		queries.push(totalCountQuery);
	}

	queries.push(articleExistsQuery);

	return Promise.all(queries).then((resolvedQueries) => {
		const comments = resolvedQueries[0].rows;
		if (resolvedQueries[1]) {
			const totalCountResults = resolvedQueries[1].rows[0].count;
			return { commentsPage: comments, total_count: totalCountResults };
		} else {
			return comments;
		}
	});
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
				return Promise.reject({
					msg: "requested comment does not exist",
				});
			}
		});
};

exports.updateCommentById = (comment_id, newVote) => {
	return db
		.query(
			`UPDATE comments
			SET votes = votes + $1
			WHERE comment_id = $2
			RETURNING *`,
			[newVote, comment_id]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested comment does not exist",
				});
			} else {
				return results.rows[0];
			}
		});
};
