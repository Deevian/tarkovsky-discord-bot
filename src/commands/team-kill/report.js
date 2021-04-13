const getDatabaseInstance = require("../../utils/getDatabaseInstance");

module.exports = (client, { id, token }, options) => {
	const report = options.reduce((acc, option) => (
		{ ...acc, [option.name]: option.value }
	), {})

	report.timestamp = Date.now();

	getDatabaseInstance()
		.get("teamkills")
		.push(report)
		.write();

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: { content: "Report added, cheeki breeki!" }
		},
	});
};
