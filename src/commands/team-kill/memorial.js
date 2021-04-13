const AsciiTable = require("ascii-table");
const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");
const {
	OPTION_TEAMKILL_MURDERER,
	OPTION_TEAMKILL_VICTIM,
	OPTION_TEAMKILL_MAP,
} = require("../../constants/options");

const topReducer = (acc, entry) => {
	if (entry[1] > (acc[1] || 0)) {
		return entry;
	}

	if (entry[1] < acc[1]) {
		return acc;
	}

	return [`${acc[0]}, ${entry[0]}`, acc[1]];
};

module.exports = (client, { id, token }) => {
	const result = getDatabaseInstance()
		.get(TABLE_TEAMKILLS)
		.reduce((acc, report) => {
			const murderer = report[OPTION_TEAMKILL_MURDERER].displayName;
			const victim = report[OPTION_TEAMKILL_VICTIM].displayName;
			const map = report[OPTION_TEAMKILL_MAP];

			if (!acc[victim]) {
				acc[victim] = { name: victim, deaths: 0, murderers: {}, maps: {} };
			}

			if (!acc[victim].murderers[murderer]) {
				acc[victim].murderers[murderer] = 0;
			}

			if (!acc[victim].maps[map]) {
				acc[victim].maps[map] = 0;
			}

			acc[victim].deaths += 1;
			acc[victim].murderers[murderer] += 1;
			acc[victim].maps[map] += 1;

			return acc;
		}, {})
		.values()
		.orderBy("deaths", "desc")
		.map((entry) => {
			const topMurderer = Object.entries(entry.murderers).reduce(
				topReducer,
				[]
			);
			const topMap = Object.entries(entry.maps).reduce(topReducer, []);

			return {
				name: entry.name,
				deaths: entry.deaths,
				topMurderer: `${topMurderer[0]} (${topMurderer[1]})`,
				topMap: `${topMap[0]} (${topMap[1]})`,
			};
		})
		.value();

	if (!result.length) {
		client.api.interactions(id, token).callback.post({
			data: {
				type: 4,
				data: { content: "No incidents have been registered as of yet" },
			},
		});

		return;
	}

	const table = new AsciiTable("In Memoriam");

	table.setHeading(
		"Deaths",
		"Player",
		'Most Murderous "Friend"',
		"Deadliest Location"
	);
	table.setAlign(0, AsciiTable.CENTER);

	result.forEach((entry) => {
		table.addRow(entry.deaths, entry.name, entry.topMurderer, entry.topMap);
	});

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: { content: `\`\`\`${table.toString()}\`\`\`` },
		},
	});
};
