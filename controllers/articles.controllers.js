const {
	fetchArticleById,
	fetchArticles,
	updateArticleByArticleId,
	insertArticle,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	fetchArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticles = (req, res, next) => {
	const { topic, sort_by, order, limit, p } = req.query;

	fetchArticles(topic, sort_by, order, limit, p)
		.then((articles) => {
			res.status(200).send({ articles });
		})
		.catch((err) => {
			next(err);
		});
};

exports.patchArticleByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	const newVote = req.body.inc_votes;
	updateArticleByArticleId(article_id, newVote)
		.then((article) => {
			return res.status(201).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.postArticle = (req, res, next) => {
	const newArticle = req.body;
	insertArticle(newArticle)
		.then((article) => {
			res.status(201).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};
