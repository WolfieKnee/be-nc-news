const {
	fetchCommentsByArticleId,
	insertCommentByArticleId,
	removeCommentById,
	updateCommentById,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	fetchCommentsByArticleId(article_id)
		.then((comments) => {
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

exports.patchCommentById = (req, res, next) => {
	const { comment_id } = req.params;
	const newVote = req.body.inc_votes;
	updateCommentById(comment_id, newVote)
		.then((comment) => res.status(201).send({ comment }))
		.catch((err) => {
			next(err);
		});
};
