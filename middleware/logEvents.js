const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");

const logEvents = async (message, fileName) => {
	const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
	const logItem = `${dateTime} ${uuid()} ${message}`;

	try {
		if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
			await fsPromise.mkdir(path.join(__dirname, "..", "logs"));
		}
		await fsPromise.appendFile(
			path.join(__dirname, "..", "logs", fileName),
			logItem
		);
	} catch (err) {
		console.log(err);
	}
};

const logger = (req, res, next) => {
	logEvents(
		`Request URL: ${req.url} \t Request Method: ${req.method}\n`,
		"errLog.log"
	);
	console.log(`Request URL: ${req.url} Request Method: ${req.method} `);
	next();
};

module.exports = { logger, logEvents };

