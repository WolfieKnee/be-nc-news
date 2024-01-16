const {
	fetchArticleById,
	fetchArticles,
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
	fetchArticles().then((articles) => {
		articles.forEach((article) => {
			return delete article.body;
		});
		res.status(200).send({ articles: articles });
	});
};
