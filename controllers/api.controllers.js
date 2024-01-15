const { fetchEndpoints } = require("../models/api.models");

exports.getEndpoints = (req, res, next) => {
	fetchEndpoints()
		.then((endpoints) => {
			return res.status(200).send({ endpoints: endpoints });
		})
		.catch((err) => {
			next(err);
		});
};
