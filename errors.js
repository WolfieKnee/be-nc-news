// custom errors
exports.handleCustomErrors = (err, req, res, next) => {
	if (
		err.msg === "unable to read the endpoints file" ||
		err.msg === "requested article does not exist"
	) {
		res.status(404).send({ msg: "Not Found" });
	} else {
		next(err);
	}
};

// PSQL errors
exports.handlePsqlErrors = (err, req, res, next) => {
	if (err.code === "22P02") {
		res.status(400).send({ msg: "Bad Request" });
	} else {
		next(err);
	}
};

// Server errors
exports.handleServerErrors = (err, req, res, next) => {
	res.status(500).send({
		message: "500 error! sorry, Dr Dev made a boo-boo",
	});
};

exports.handleBadEndpoint = (req, res) => {
	res.status(404).send({
		msg: `Not Found. ${req.originalUrl} is not a valid endpoint. Try /api/`,
	});
};
