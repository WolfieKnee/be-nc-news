const {
	fetchArticleById,
	fetchArticles,
	updateArticleByArticleId,
} = require("../models/articles.models");
const { checkTopicExists } = require("./controllers.utils");

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
	const { topic, sort_by } = req.query;
	const articlesQuery = fetchArticles(topic, sort_by);
	const queries = [articlesQuery];
	if (topic) {
		const topicExistsQuery = checkTopicExists(topic);
		queries.push(topicExistsQuery);
	}
	Promise.all(queries)
		.then((resolvedPromises) => {
			const articles = resolvedPromises[0];
			articles.forEach((article) => {
				return delete article.body;
			});
			res.status(200).send({ articles: articles });
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
