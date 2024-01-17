const {
	fetchCommentsByArticleId,
	insertCommentByArticleId,
	removeCommentById,
} = require("../models/comments.models");
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

exports.postCommentByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	const newComment = req.body;
	insertCommentByArticleId(article_id, newComment)
		.then((comment) => {
			res.status(201).send({ comment });
		})
		.catch((err) => {
			next(err);
		});
};

exports.deleteCommentById = (req, res, next) => {
	const { comment_id } = req.params;
	removeCommentById(comment_id)
		.then(() => res.status(204).send())
		.catch((err) => next(err));
};
