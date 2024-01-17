const {
	fetchArticleById,
	fetchArticles,
	updateArticleByArticleId,
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

exports.getArticles = (req, res) => {
	const { topic = "" } = req.query;
	fetchArticles(topic).then((articles) => {
		articles.forEach((article) => {
			return delete article.body;
		});
		res.status(200).send({ articles: articles });
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
