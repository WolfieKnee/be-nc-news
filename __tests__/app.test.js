const app = require("../app");
const request = require("supertest");

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
	describe("GET: 200 /topics", () => {
		test("should respond with status code 200", () => {
			return request(app).get("/api/topics").expect(200);
		});
		test("should respond with an array of topic objects, each of which should have the following properties: slug, description", () => {
			return request(app)
				.get("/api/topics")
				.expect(200)
				.then((response) => {
					const { topics } = response.body;
					expect(Array.isArray(topics)).toBe(true);
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
});
