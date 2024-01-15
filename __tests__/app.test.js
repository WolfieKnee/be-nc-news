const app = require("../app");
const request = require("supertest");
const fs = require("fs/promises");

// connect to the db
const db = require("../db/connection");

// require the test data and seed function to allow re seeding of test data
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

// re-seed the database
beforeEach(() => seed(data));

// close the connection to the database
afterAll(() => db.end());

describe("/api", () => {
	test("GET: 200 should respond with an object object describing all the available endpoints on this API", () => {
		fs.readFile("./endpoints.json", "utf8")
			.then((fileContents) => {
				return JSON.parse(fileContents);
			})
			.then((expected) => {
				return request(app)
					.get("/api")
					.expect(200)
					.then((response) => {
						const { endpoints } = response.body;
						expect(endpoints).toMatchObject(expected);
					});
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
				.get("/api/article/1")
				.expect(200)
				.then((response) => {
					const { article } = response.body;
					for (const key in expected) {
						expect(article.key).toEqual(expected.key);
					}
				});
		});
		// TODO: error handling
		// TODO: add to endpoints.json
	});
});
