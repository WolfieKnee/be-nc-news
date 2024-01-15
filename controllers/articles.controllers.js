const { fetchArticleById } = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	// console.log(article_id, "<< article_id in controller");
	fetchArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article });
		})
		.catch((err) => {
			next(err);
		});
};
