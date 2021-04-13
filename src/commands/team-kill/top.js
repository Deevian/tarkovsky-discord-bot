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

			if (!acc[murderer]) {
				acc[murderer] = { name: murderer, kills: 0, victims: {}, maps: {} };
			}

			if (!acc[murderer].victims[victim]) {
				acc[murderer].victims[victim] = 0;
			}

			if (!acc[murderer].maps[map]) {
				acc[murderer].maps[map] = 0;
			}

			acc[murderer].kills += 1;
			acc[murderer].victims[victim] += 1;
			acc[murderer].maps[map] += 1;

			return acc;
		}, {})
		.values()
		.orderBy("kills", "desc")
		.map((entry) => {
			const topVictim = Object.entries(entry.victims).reduce(topReducer, []);
			const topMap = Object.entries(entry.maps).reduce(topReducer, []);

			return {
				name: entry.name,
				kills: entry.kills,
				topVictim: `${topVictim[0]} (${topVictim[1]})`,
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

	const table = new AsciiTable("Most Dangerous of Tarkovland");

	table.setHeading("Kills", "Player", "Favorite Prey", "Favorite Location");
	table.setAlign(0, AsciiTable.CENTER);

	result.forEach((entry) => {
		table.addRow(entry.kills, entry.name, entry.topVictim, entry.topMap);
	});

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: { content: `\`\`\`${table.toString()}\`\`\`` },
		},
	});
};
