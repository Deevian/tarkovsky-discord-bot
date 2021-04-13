const dayjs = require("dayjs");
const AsciiTable = require("ascii-table");
const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");
const { OPTION_TEAMKILL_TIMESTAMP } = require("../../constants/options");

module.exports = (client, { id, token }, options) => {
	const itemsPerPage = 10;
	const page = (options && options[0].value) || 1;

	const result = getDatabaseInstance()
		.get(TABLE_TEAMKILLS)
		.orderBy(OPTION_TEAMKILL_TIMESTAMP, "desc")
		.drop(itemsPerPage * (page - 1))
		.take(10)
		.value();

	if (!result.length) {
		const content =
			page === 0
				? "No incident has been registered as of yet"
				: "No incidents are available for the selected page";

		client.api.interactions(id, token).callback.post({
			data: { type: 4, data: { content } },
		});

		return;
	}

	const table = new AsciiTable(`List of Team Kills | Page ${page}`);

	table.setHeading("Date", "Murderer", "Victim", "Location", "Additional Info");
	result.forEach((entry) => {
		table.addRow(
			dayjs(entry.timestamp).format("MMMM D, YYYY h:mm A"),
			entry.murderer.displayName,
			entry.victim.displayName,
			entry.map,
			entry.info
		);
	});

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: { content: `\`\`\`${table.toString()}\`\`\`` },
		},
	});
};
