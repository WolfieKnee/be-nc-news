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

exports.fetchArticles = (
	topic,
	sort_by = "created_at",
	order = "DESC",
	limit,
	page
) => {
	const queryValues = [];
	const validSortQuery = [
		"created_at",
		"title",
		"topic",
		"author",
		"votes",
		"article_id",
		"comment_count",
	];
	const validOrderQuery = ["DESC", "desc", "ASC", "asc"];
	if (!validSortQuery.includes(sort_by)) {
		return Promise.reject({ msg: "invalid sort query" });
	}
	if (!validOrderQuery.includes(order)) {
		return Promise.reject({ msg: "invalid order query" });
	}
	if ((limit && !Number(limit)) || (page && !Number(page))) {
		return Promise.reject({ msg: "invalid pagination query" });
	}

	let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT 
	AS comment_count FROM articles LEFT OUTER JOIN comments 
	ON comments.article_id = articles.article_id`;
	if (topic) {
		queryValues.push(topic);
		queryStr += ` WHERE topic = $1`;
	}
	queryStr += ` GROUP BY articles.article_id `;
	queryStr += ` ORDER BY ${sort_by} ${order}`;

	if (limit) {
		queryStr += ` LIMIT ${limit} `;
		if (page) {
			queryStr += ` OFFSET ${page * limit - limit} `;
		}
	}

	const articlesQuery = db.query(queryStr, queryValues);
	const queries = [articlesQuery];

	if (limit) {
		const totalCountQueryValues = [];
		let totalCountQueryStr = `SELECT count(*) FROM articles`;
		if (topic) {
			totalCountQueryStr += ` WHERE topic = $1`;
			totalCountQueryValues.push(topic);
		}
		const totalCountQuery = db.query(
			totalCountQueryStr,
			totalCountQueryValues
		);
		queries.push(totalCountQuery);
	}

	if (topic) {
		const topicExistsQuery = checkTopicExists(topic);
		queries.push(topicExistsQuery);
	}

	return Promise.all(queries).then((resolvedQueries) => {
		const articleResults = resolvedQueries[0].rows;
		if (resolvedQueries[1]) {
			const totalCountResults = resolvedQueries[1].rows[0].count;
			return {
				total_count: totalCountResults,
				articlesPage: articleResults,
			};
		} else {
			return articleResults;
		}
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

exports.removeArticleById = (article_id) => {
	return db
		.query(
			`DELETE FROM comments
		WHERE comment_id = $1
		RETURNING *`,
			[article_id]
		)
		.then((result) => {
			if (result.rows.length === 0) {
				return Promise.reject({
					msg: "requested article does not exist",
				});
			}
		});
};
