const fs = require("fs/promises");

exports.fetchEndpoints = () => {
	// read the endpoints.json
	return fs
		.readFile("./endpoints.json", "utf8")
		.then((endpoints) => {
			return JSON.parse(endpoints);
		})
		.catch((err) => {
			return Promise.reject({ msg: "unable to read the endpoints file" });
		});
};
