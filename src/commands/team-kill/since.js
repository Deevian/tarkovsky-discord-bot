const dayjs = require("dayjs");
const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");
const { OPTION_TEAMKILL_TIMESTAMP } = require("../../constants/options");

module.exports = (client, { id, token }) => {
	const result = getDatabaseInstance()
		.get(TABLE_TEAMKILLS)
		.orderBy(OPTION_TEAMKILL_TIMESTAMP, "desc")
		.take(1)
		.value();

	if (!result.length) {
		client.api.interactions(id, token).callback.post({
			data: {
				type: 4,
				data: { content: "No incident has been registered as of yet" },
			},
		});

		return;
	}

	const timestamp = result[0][OPTION_TEAMKILL_TIMESTAMP];

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: {
				content: `Time Since Last Incident: **${dayjs(timestamp).fromNow(
					true
				)}**`,
			},
		},
	});
};
