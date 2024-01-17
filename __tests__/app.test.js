const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const { expect } = require("@jest/globals");

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
	describe("/topics", () => {
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
	describe("/articles", () => {
		describe("GET by :article_id", () => {
			test("GET: 200 /:article_id should respond with an article object with the associated properties.", () => {
				const expected = {
					article_id: 1,
					title: "Living in the shadow of a great man",
					topic: "mitch",
					author: "butter_bridge",
					body: "I find this existence challenging",
					created_at: 1594329060000,
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
							expect(article.key).toEqual(expected.key);
						}
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

		describe("GET articles", () => {
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
	});
	describe("POST comments by article_id", () => {
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
});

describe("spying on console log", () => {
	test("console log has not been called", () => {
		expect(consoleSpy).not.toHaveBeenCalled();
	});
});
