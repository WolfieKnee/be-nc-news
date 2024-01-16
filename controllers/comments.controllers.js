const { fetchCommentsByArticleId } = require("../models/comments.models");
const { checkArticleExists } = require("./controllers.utils");

exports.getCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	const fetchCommentsQuery = fetchCommentsByArticleId(article_id);
	const articleExistsQuery = checkArticleExists(article_id);

	Promise.all([fetchCommentsQuery, articleExistsQuery])
		.then((response) => {
			const comments = response[0];
			res.status(200).send({ comments });
		})
		.catch((err) => {
			next(err);
		});
};
