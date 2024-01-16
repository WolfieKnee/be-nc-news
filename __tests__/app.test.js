const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => seed(data));
afterAll(() => db.end());

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
		// 404: not found?
		// 400: bad request?
	});
});
