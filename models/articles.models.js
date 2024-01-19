const db = require("../db/connection");
const { checkTopicExists, checkUserExists } = require("./models.utils");

exports.fetchArticleById = (article_id) => {
	return db
		.query(
			`SELECT articles.*, 
			COUNT(comments.comment_id) AS comment_count 
			FROM articles LEFT OUTER JOIN comments 
			ON comments.article_id = articles.article_id
			WHERE articles.article_id = $1
			GROUP BY articles.article_id`,
			[article_id]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested article does not exist",
				});
			} else {
				return results.rows[0];
			}
		});
};

exports.fetchArticles = (topic, sort_by = "created_at", order = "DESC") => {
	const queryValues = [];
	const validSortQuery = [
		"created_at",
		"title",
		"topic",
		"author",
		"votes",
		"article_id",
	];
	const validOrderQuery = ["DESC", "desc", "ASC", "asc"];
	if (!validSortQuery.includes(sort_by)) {
		return Promise.reject({ msg: "invalid sort query" });
	}
	if (!validOrderQuery.includes(order)) {
		return Promise.reject({ msg: "invalid order query" });
	}

	let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) 
	AS comment_count FROM articles LEFT OUTER JOIN comments 
	ON comments.article_id = articles.article_id`;
	if (topic) {
		queryValues.push(topic);
		queryStr += ` WHERE topic = $1`;
	}
	queryStr += ` GROUP BY articles.article_id `;
	queryStr += ` ORDER BY ${sort_by} ${order}`;

	const articlesQuery = db.query(queryStr, queryValues);
	const queries = [articlesQuery];
	if (topic) {
		const topicExistsQuery = checkTopicExists(topic);
		queries.push(topicExistsQuery);
	}
	return Promise.all(queries).then((resolvedQueries) => {
		const results = resolvedQueries[0];
		return results.rows;
	});
};

exports.updateArticleByArticleId = (article_id, newVote) => {
	return db
		.query(
			`UPDATE articles
			SET votes = votes + $1
			WHERE article_id = $2
			RETURNING *`,
			[newVote, article_id]
		)
		.then((results) => {
			if (results.rows.length === 0) {
				return Promise.reject({
					msg: "requested article does not exist",
				});
			} else {
				return results.rows[0];
			}
		});
};

exports.insertArticle = (newArticle) => {
	let queryStr = `INSERT INTO articles
	(author, title, body, topic `;

	const queryValues = [
		newArticle.author,
		newArticle.title,
		newArticle.body,
		newArticle.topic,
	];

	if (newArticle.article_img_url) {
		queryStr += ` , article_img_url)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING * `;
		queryValues.push(newArticle.article_img_url);
	} else {
		queryStr += ` )
		VALUES ($1, $2, $3, $4)
		RETURNING *`;
	}

	return db.query(queryStr, queryValues).then((results) => {
		const article = results.rows[0];
		return { ...article, comment_count: "0" };
	});
};
