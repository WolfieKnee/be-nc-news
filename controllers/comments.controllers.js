const { fetchCommentsByArticleId } = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res) => {
	const { article_id } = req.params;
	fetchCommentsByArticleId(article_id).then((comments) => {
		res.status(200).send({ comments });
	});
};
