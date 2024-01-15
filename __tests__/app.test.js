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
});
describe("/topics", () => {
	test("GET: 200 should respond with status code 200", () => {
		return request(app).get("/api/topics").expect(200);
	});
	test("GET: should respond with an array of topic objects, each of which should have the following properties: slug, description", () => {
		return request(app)
			.get("/api/topics")
			.expect(200)
			.then((response) => {
				const { topics } = response.body;
				expect(Array.isArray(topics)).toBe(true);
				topics.forEach((topic) => {
					expect(topic).toHaveProperty("slug", expect.any(String));
					expect(topic).toHaveProperty(
						"description",
						expect.any(String)
					);
				});
			});
	});
});
