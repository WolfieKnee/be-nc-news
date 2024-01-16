const db = require("../db/connection");

exports.fetchCommentsByArticleId = (article_id) => {
	return db
		.query(
			`SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`,
			[article_id]
		)
		.then((results) => {
			// if (results.rows.length === 0) {
			// 	return Promise.reject({
			// 		msg: "requested article does not exist",
			// 	});
			// } else {
			return results.rows;
			// }
		});
};
