const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const { expect } = require("@jest/globals");
const { forEach } = require("../db/data/test-data/articles");

beforeEach(() => {
	consoleSpy = jest.spyOn(console, "log");
	return seed(data);
});

afterAll(() => {
	consoleSpy.mockRestore();
	db.end();
});

describe("/api", () => {
	test("GET: 200 should respond with an object describing all the available endpoints on this API", () => {
		return request(app)
			.get("/api")
			.expect(200)
			.then((response) => {
				const { endpoints } = response.body;
				expect(Object.keys(endpoints).length).not.toBe(0);
				for (const endpoint in endpoints) {
					expect(endpoints[endpoint]).toHaveProperty("description");
				}
			});
	});
	test("*: /api/invalid should respond with 404 not found if requesting an invalid endpoint", () => {
		return request(app)
			.get("/api/invalid")
			.expect(404)
			.then((response) => {
				const { msg } = response.body;
				expect(msg).toBe(
					"Not Found. /api/invalid is not a valid endpoint. Try /api/"
				);
			});
	});
	describe("GET /topics", () => {
		test("GET: 200 should respond with an array of topic objects, each of which should have the following properties: slug, description", () => {
			return request(app)
				.get("/api/topics")
				.expect(200)
				.then((response) => {
					const { topics } = response.body;
					expect(topics.length).toBe(3);
					topics.forEach((topic) => {
						expect(topic).toHaveProperty(
							"slug",
							expect.any(String)
						);
						expect(topic).toHaveProperty(
							"description",
							expect.any(String)
						);
					});
				});
		});
	});
	describe("GET /articles", () => {
		test("GET: 200 / should respond with an array of article objects with the defined properties, _not including_ comment_count", () => {
			return request(app)
				.get("/api/articles/")
				.expect(200)
				.then((response) => {
					const { articles } = response.body;
					expect(articles.length).toBe(13);
					articles.forEach((article) => {
						expect(article).toHaveProperty(
							"author",
							expect.any(String)
						);
						expect(article).toHaveProperty(
							"title",
							expect.any(String)
						);
						expect(article).toHaveProperty(
							"article_id",
							expect.any(Number)
						);
						expect(article).toHaveProperty(
							"topic",
							expect.any(String)
						);
						expect(article).toHaveProperty(
							"created_at",
							expect.any(String)
						);
						expect(article).toHaveProperty(
							"votes",
							expect.any(Number)
						);
						expect(article).toHaveProperty(
							"article_img_url",
							expect.any(String)
						);
					});
				});
		});
		test("GET: 200 / articles should not have a body property", () => {
			return request(app)
				.get("/api/articles/")
				.expect(200)
				.then((response) => {
					const { articles } = response.body;
					articles.forEach((article) => {
						expect(article).not.toHaveProperty("body");
					});
				});
		});
		test("GET: 200 / articles should be sorted by date, descending", () => {
			return request(app)
				.get("/api/articles/")
				.expect(200)
				.then((response) => {
					const { articles } = response.body;
					expect(articles).toBeSortedBy("created_at", {
						descending: true,
					});
				});
		});
		test("GET: 200 / articles should include the comment count ", () => {
			return request(app)
				.get("/api/articles/")
				.expect(200)
				.then((response) => {
					const { articles } = response.body;
					articles.forEach((article) => {
						expect(article).toHaveProperty(
							"comment_count",
							expect.any(String)
						);
						if (article.article_id === 1) {
							expect(article.comment_count).toBe("11");
						}
					});
				});
		});
		describe("GET by :article_id", () => {
			test("GET: 200 /:article_id should respond with an article object with the associated properties.", () => {
				const expected = {
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: "2020-07-09T20:11:00.000Z",
					votes: 100,
					article_img_url:
						"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
				};
				return request(app)
					.get("/api/articles/1")
					.expect(200)
					.then((response) => {
						const { article } = response.body;
						for (const key in expected) {
							expect(article[key]).toEqual(expected[key]);
						}
					});
			});

			test("GET: 200 /:article_id should respond with an article object which includes a comment count", () => {
				return request(app)
					.get("/api/articles/1")
					.expect(200)
					.then((response) => {
						const { article } = response.body;
						expect(article.comment_count).toBe("11");
					});
			});

			test("GET: 400 /invalid_id should respond with Bad Request", () => {
				return request(app)
					.get("/api/articles/invalid_id")
					.expect(400)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Bad Request");
					});
			});
			test("GET: 404 /20 should respond with Not Found", () => {
				return request(app)
					.get("/api/articles/20")
					.expect(404)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Not Found");
					});
			});
		});
		describe("GET articles by ?topic", () => {
			test("GET: 200 ?topic=slug should response with an array of all articles with the specified topic", () => {
				return request(app)
					.get("/api/articles?topic=mitch")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles.length).toBe(12);
						articles.forEach((article) => {
							expect(article.topic).toBe("mitch");
						});
					});
			});
			test("GET: 200 ?invalid=mitch should ignore the invalid query and just return all the articles", () => {
				return request(app)
					.get("/api/articles?invalid=mitch")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles.length).toBe(13);
					});
			});
			test("GET: 404 ?topic=notATopic should response with Not Found", () => {
				return request(app)
					.get("/api/articles?topic=notATopic")
					.expect(404)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Not Found");
					});
			});
			test("GET: 200 ?topic=paper should respond with empty array for a topic with no articles", () => {
				return request(app)
					.get("/api/articles?topic=paper")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles.length).toBe(0);
					});
			});
		});
		describe("GET comments by :article_id", () => {
			test("GET: 200 /:article_id/comments should respond with an array of all the comments on the given article ", () => {
				return request(app)
					.get("/api/articles/1/comments")
					.expect(200)
					.then((response) => {
						const { comments } = response.body;
						expect(comments.length).toBe(11);
						comments.forEach((comment) => {
							expect(comment).toHaveProperty(
								"comment_id",
								expect.any(Number)
							);
							expect(comment).toHaveProperty(
								"votes",
								expect.any(Number)
							);
							expect(comment).toHaveProperty(
								"created_at",
								expect.any(String)
							);
							expect(comment).toHaveProperty(
								"author",
								expect.any(String)
							);
							expect(comment).toHaveProperty(
								"body",
								expect.any(String)
							);
							expect(comment).toHaveProperty("article_id", 1);
						});
					});
			});
			test("GET: 200 comments should be served the with most recent first", () => {
				return request(app)
					.get("/api/articles/1/comments")
					.expect(200)
					.then((response) => {
						const { comments } = response.body;
						expect(comments).toBeSortedBy("created_at", {
							descending: true,
						});
					});
			});
			test("GET: 400 /invalid/comments should respond with Bad Request", () => {
				return request(app)
					.get("/api/articles/invalid/comments")
					.expect(400)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Bad Request");
					});
			});
			test("GET: 404 /222/comments should respond with Not Found", () => {
				return request(app)
					.get("/api/articles/222/comments")
					.expect(404)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Not Found");
					});
			});
			test("GET: 200 /2/comments should respond with an empty array", () => {
				return request(app)
					.get("/api/articles/2/comments")
					.expect(200)
					.then((response) => {
						const { comments } = response.body;
						expect(comments.length).toBe(0);
					});
			});
		});
		describe("GET articles sorted by the following queries: title, topic, author, date, votes", () => {
			test("GET: 200 ?sort_by=title should serve the articles sorted by title, default descending", () => {
				return request(app)
					.get("/api/articles?sort_by=title")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("title", {
							descending: true,
						});
					});
			});
			test("GET: 400 ?sort_by=invalid should return Bad Request", () => {
				return request(app)
					.get("/api/articles?sort_by=invalid")
					.expect(400)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Bad Request");
					});
			});
			test("GET: 200 ?sort_by=topic should serve the articles sorted by topic, default descending", () => {
				return request(app)
					.get("/api/articles?sort_by=topic")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("topic", {
							descending: true,
						});
					});
			});
			test("GET: 200 ?sort_by=author should serve the articles sorted by author, default descending", () => {
				return request(app)
					.get("/api/articles?sort_by=author")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("author", {
							descending: true,
						});
					});
			});
			test("GET: 200 ?sort_by=created_at should serve the articles sorted by created_at, default descending", () => {
				return request(app)
					.get("/api/articles?sort_by=created_at")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("created_at", {
							descending: true,
						});
					});
			});
			test("GET: 200 ?sort_by=votes should serve the articles sorted by votes, default descending", () => {
				return request(app)
					.get("/api/articles?sort_by=votes")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("votes", {
							descending: true,
						});
					});
			});
			test("GET: 200 ?topic=mitch&sort_by=votes should serve the articles with topic of mitch, sorted by votes, default descending", () => {
				return request(app)
					.get("/api/articles?topic=mitch&sort_by=votes")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles.length).toBe(12);
						expect(articles).toBeSortedBy("votes", {
							descending: true,
						});
						articles.forEach((article) => {
							expect(article.topic).toBe("mitch");
						});
					});
			});
		});
		describe("GET articles in the specified sort order", () => {
			test("GET: 200 articles?order=asc should return all the articles in ascending order", () => {
				return request(app)
					.get("/api/articles?order=asc")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("created_at", {
							ascending: true,
						});
					});
			});
			test("GET: 200 articles?order=ASC should return all the articles in ascending order", () => {
				return request(app)
					.get("/api/articles?order=ASC")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("created_at", {
							ascending: true,
						});
					});
			});
			test("GET: 400 articles?order=invalid should return Bad Request", () => {
				return request(app)
					.get("/api/articles?order=invalid")
					.expect(400)
					.then((response) => {
						const { msg } = response.body;
						expect(msg).toBe("Bad Request");
					});
			});
			test("GET: 200 articles?order=desc should return all the articles in descending order", () => {
				return request(app)
					.get("/api/articles?order=desc")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles).toBeSortedBy("created_at", {
							descending: true,
						});
					});
			});
			test("GET: 200 articles?topic=mitch&sort_by=votes&order=asc should respond with specified article, correctly sorted", () => {
				return request(app)
					.get("/api/articles?topic=mitch&sort_by=votes&order=asc")
					.expect(200)
					.then((response) => {
						const { articles } = response.body;
						expect(articles.length).toBe(12);
						expect(articles).toBeSortedBy("votes", {
							ascending: true,
						});
						articles.forEach((article) => {
							expect(article.topic).toBe("mitch");
						});
					});
			});
		});
	});
	describe("POST /articles adds a new article", () => {
		test("POST: 201 should post a new article and return the new article object. This test does not include comment_count", () => {
			const newArticle = {
				author: "icellusedkars",
				title: "The best cheese",
				body: "I love cheese, especially airedale airedale. Monterey jack rubber cheese cheese strings melted cheese port-salut camembert de normandie cream cheese red leicester. Emmental blue castello cheese and biscuits blue castello emmental macaroni cheese the big cheese croque monsieur. Halloumi squirty cheese taleggio roquefort.",
				topic: "mitch",
				article_img_url:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Vella_Cheese_Young_Jack_%28cropped%29.jpg/1200px-Vella_Cheese_Young_Jack_%28cropped%29.jpg",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(201)
				.then((response) => {
					const { article } = response.body;
					expect(article.article_id).toBe(14);
					expect(article).toHaveProperty(
						"created_at",
						expect.any(String)
					);
					expect(article.votes).toBe(0);
					expect(article.author).toBe("icellusedkars");
					expect(article.title).toBe("The best cheese");
					expect(article.body).toBe(
						"I love cheese, especially airedale airedale. Monterey jack rubber cheese cheese strings melted cheese port-salut camembert de normandie cream cheese red leicester. Emmental blue castello cheese and biscuits blue castello emmental macaroni cheese the big cheese croque monsieur. Halloumi squirty cheese taleggio roquefort."
					);
					expect(article.topic).toBe("mitch");
					expect(article.article_img_url).toBe(
						"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Vella_Cheese_Young_Jack_%28cropped%29.jpg/1200px-Vella_Cheese_Young_Jack_%28cropped%29.jpg"
					);
				});
		});
		test("POST: 201 should post a new article and return the new article object with comment_count and default img_url", () => {
			const newArticle = {
				author: "icellusedkars",
				title: "The best cheese",
				body: "I love cheese, especially airedale airedale. Monterey jack rubber cheese cheese strings melted cheese port-salut camembert de normandie cream cheese red leicester. Emmental blue castello cheese and biscuits blue castello emmental macaroni cheese the big cheese croque monsieur. Halloumi squirty cheese taleggio roquefort.",
				topic: "mitch",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(201)
				.then((response) => {
					const { article } = response.body;
					expect(article.comment_count).toBe("0");
					expect(article.article_img_url).toBe(
						"https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
					);
				});
		});
		test("POST: 404 should respond with Not Found if author: notAnAuthor", () => {
			const newArticle = {
				author: "notAnAuthor",
				title: "The best cheese",
				body: "I love cheese",
				topic: "mitch",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
		test("POST: 404 should respond with Not Found if topic: notATopic", () => {
			const newArticle = {
				author: "icellusedkars",
				title: "The best cheese",
				body: "I love cheese",
				topic: "notATopic",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
		test("POST: 400 should respond with Bad Request if there is no title", () => {
			const newArticle = {
				author: "icellusedkars",
				body: "I love cheese",
				topic: "mitch",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("POST: 400 should respond with Bad Request if there is no body", () => {
			const newArticle = {
				author: "icellusedkars",
				title: "The best cheese",
				topic: "mitch",
			};
			return request(app)
				.post("/api/articles")
				.send(newArticle)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
	});
	describe("POST /articles comment by article_id", () => {
		test("POST: 201 /1/comments should add the comment and respond with the new comment", () => {
			const newComment = {
				username: "butter_bridge",
				body: "Mitch for President",
			};
			return request(app)
				.post("/api/articles/1/comments")
				.send(newComment)
				.expect(201)
				.then((response) => {
					const { comment } = response.body;
					expect(comment.body).toBe("Mitch for President");
					expect(comment.author).toBe("butter_bridge");
					expect(comment.votes).toBe(0);
					expect(comment).toHaveProperty(
						"article_id",
						expect.any(Number)
					);
					expect(comment).toHaveProperty(
						"created_at",
						expect.any(String)
					);
				});
		});
		test("POST: 400 /invalid/comments should return Bad Request", () => {
			const newComment = {
				username: "butter_bridge",
				body: "Mitch for President",
			};
			return request(app)
				.post("/api/articles/invalid/comments")
				.send(newComment)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("POST: 404 /222/comments should return Not Found for non-existant article", () => {
			const newComment = {
				username: "butter_bridge",
				body: "Mitch for President",
			};
			return request(app)
				.post("/api/articles/222/comments")
				.send(newComment)
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
		test("POST: 404 /1/comments with invalid author should return Not Found", () => {
			const newComment = {
				username: "invalid",
				body: "Mitch for President",
			};
			return request(app)
				.post("/api/articles/1/comments")
				.send(newComment)
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
		test("POST: 400 /1/comments with missing comment-body should return Bad Request", () => {
			const newComment = {
				username: "butter_bridge",
			};
			return request(app)
				.post("/api/articles/1/comments")
				.send(newComment)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("POST: 400 /1/comments with missing author should return Bad Request", () => {
			const newComment = {
				body: "Mitch for President",
			};
			return request(app)
				.post("/api/articles/1/comments")
				.send(newComment)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("POST: 400 /1/comments with missing post-body should return Bad Request", () => {
			return request(app)
				.post("/api/articles/1/comments")
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("POST: 201 /1/comments with extra properties in the post should add the comment and respond with the new comment", () => {
			const newComment = {
				username: "butter_bridge",
				body: "Mitch for President",
				randomKey: "invalid",
			};
			return request(app)
				.post("/api/articles/1/comments")
				.send(newComment)
				.expect(201)
				.then((response) => {
					const { comment } = response.body;
					expect(comment.body).toBe("Mitch for President");
					expect(comment.author).toBe("butter_bridge");
					expect(comment.votes).toBe(0);
					expect(comment).toHaveProperty(
						"article_id",
						expect.any(Number)
					);
					expect(comment).toHaveProperty(
						"created_at",
						expect.any(String)
					);
				});
		});
	});
	describe("PATCH /articles  by article_id", () => {
		test("PATCH: 201 /1 should update the article by increasing the votes by the requested amount", () => {
			const newVote = { inc_votes: 10 };
			const expected = {
				article_id: 1,
				title: "Living in the shadow of a great man",
				topic: "mitch",
				author: "butter_bridge",
				body: "I find this existence challenging",
				created_at: "2020-07-09T20:11:00.000Z",
				votes: 110,
				article_img_url:
					"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
			};
			return request(app)
				.patch("/api/articles/1")
				.send(newVote)
				.expect(201)
				.then((response) => {
					const { article } = response.body;
					for (const key in expected) {
						expect(article[key]).toEqual(expected[key]);
					}
				});
		});
		test("PATCH: 201 /1 should update the article by decreasing the votes by the requested amount", () => {
			const newVote = { inc_votes: -10 };
			const expected = {
				article_id: 1,
				title: "Living in the shadow of a great man",
				topic: "mitch",
				author: "butter_bridge",
				body: "I find this existence challenging",
				created_at: "2020-07-09T20:11:00.000Z",
				votes: 90,
				article_img_url:
					"https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
			};
			return request(app)
				.patch("/api/articles/1")
				.send(newVote)
				.expect(201)
				.then((response) => {
					const { article } = response.body;
					for (const key in expected) {
						expect(article[key]).toEqual(expected[key]);
					}
				});
		});
		test("PATCH: 400 /invalid should respond with Bad Request", () => {
			const newVote = { inc_votes: -10 };
			return request(app)
				.patch("/api/articles/invalid")
				.send(newVote)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("PATCH: 404 /222 should respond with Not Found if article doesn't exist", () => {
			const newVote = { inc_votes: -10 };
			return request(app)
				.patch("/api/articles/222")
				.send(newVote)
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
		test("PATCH: 400 /1 should respond with Bad Request if sent empty patch body", () => {
			const newVote = {};
			return request(app)
				.patch("/api/articles/1")
				.send(newVote)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("PATCH: 400 /1 should respond with Bad Request if sent invalid patch body", () => {
			const newVote = { inc_votes: "invalid" };
			return request(app)
				.patch("/api/articles/1")
				.send(newVote)
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
	});
	describe("DELETE /comments by comment_id", () => {
		test("DELETE: 204 /comments/:comment_id should delete the specified comment and respond with no content", () => {
			return request(app)
				.delete("/api/comments/1")
				.expect(204)
				.then((response) => {
					expect(response.body).toEqual({});
				});
		});
		test("DELETE: 400 /comments/invalid respond with Bad Request", () => {
			return request(app)
				.delete("/api/comments/invalid")
				.expect(400)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Bad Request");
				});
		});
		test("DELETE: 404 /comments/222 respond with Not Found", () => {
			return request(app)
				.delete("/api/comments/222")
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
	});
	describe("GET /users", () => {
		test("GET: 200 / should return and array of user objects with the specified properties", () => {
			return request(app)
				.get("/api/users")
				.expect(200)
				.then((response) => {
					const { users } = response.body;
					expect(users.length).toBe(4);
					users.forEach((user) => {
						expect(user).toHaveProperty(
							"username",
							expect.any(String)
						);
						expect(user).toHaveProperty("name", expect.any(String));
						expect(user).toHaveProperty(
							"avatar_url",
							expect.any(String)
						);
					});
				});
		});
		test("GET: 200 /:username respond with the requested user object", () => {
			return request(app)
				.get("/api/users/butter_bridge")
				.expect(200)
				.then((response) => {
					const { user } = response.body;
					expect(user.username).toBe("butter_bridge");
					expect(user.avatar_url).toBe(
						"https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
					);
					expect(user.name).toBe("jonny");
				});
		});
		test("GET: 404 /noSuchUser respond with Bad Request", () => {
			return request(app)
				.get("/api/users/noSuchUser")
				.expect(404)
				.then((response) => {
					const { msg } = response.body;
					expect(msg).toBe("Not Found");
				});
		});
	});
});

describe("spying on console log", () => {
	test("console log has not been called", () => {
		expect(consoleSpy).not.toHaveBeenCalled();
	});
});
