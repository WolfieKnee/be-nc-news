const {
	getArticles,
	getArticleById,
	patchArticleByArticleId,
	postArticle,
} = require("../controllers/articles.controllers");
const {
	getCommentsByArticleId,
	postCommentByArticleId,
} = require("../controllers/comments.controllers");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
	.route("/:article_id")
	.get(getArticleById)
	.patch(patchArticleByArticleId);

articlesRouter
	.route("/:article_id/comments")
	.get(getCommentsByArticleId)
	.post(postCommentByArticleId);

module.exports = articlesRouter;