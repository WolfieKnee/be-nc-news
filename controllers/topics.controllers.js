const { fetchTopics } = require("../models/topics.models");

exports.getTopics = (req, res) => {
	fetchTopics().then((topics) => {
		return res.status(200).send({ topics });
	});
	// .catch((err) => {
	// 	console.log(err, "<< controller err");
	// });
};
