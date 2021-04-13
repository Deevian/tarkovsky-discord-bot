const AsciiTable = require("ascii-table");
const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");

const topReducer = (acc, entry) => {
	if (entry[1] > (acc[1] || 0)) {
		return entry;
	}

	if (entry[1] < acc[1]) {
		return acc;
	}

	return [`${acc[0]}, ${entry[0]}`, acc[1]];
};

module.exports = (client, interaction, options) => {
	const userId = options[0].value;
	const result = getDatabaseInstance()
		.get(TABLE_TEAMKILLS)
		.reduce(
			(acc, entry) => {
				if (entry.murderer.id === userId) {
					acc.kills.push(entry);
				}

				if (entry.victim.id === userId) {
					acc.deaths.push(entry);
				}

				return acc;
			},
			{ kills: [], deaths: [] }
		)
		.value();

	if (!result.kills.length && !result.deaths.length) {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: { content: "No stats are available for this player" },
			},
		});

		return;
	}

	let topMurderer;
	let topDeathMap;
	let topVictim;
	let topMurderMap;

	if (result.kills.length !== 0) {
		const [victimCount, murderMapCount] = result.kills.reduce(
			(acc, kill) => {
				if (!acc[0][kill.victim.displayName]) {
					acc[0][kill.victim.displayName] = 0;
				}

				if (!acc[1][kill.map]) {
					acc[1][kill.map] = 0;
				}

				acc[0][kill.victim.displayName] += 1;
				acc[1][kill.map] += 1;

				return acc;
			},
			[{}, {}]
		);

		topVictim = Object.entries(victimCount).reduce(topReducer, []);
		topMurderMap = Object.entries(murderMapCount).reduce(topReducer, []);
	}

	if (result.deaths.length !== 0) {
		const [murdererCount, deathMapCount] = result.deaths.reduce(
			(acc, death) => {
				if (!acc[0][death.murderer.displayName]) {
					acc[0][death.murderer.displayName] = 0;
				}

				if (!acc[1][death.map]) {
					acc[1][death.map] = 0;
				}

				acc[0][death.murderer.displayName] += 1;
				acc[1][death.map] += 1;

				return acc;
			},
			[{}, {}]
		);

		topMurderer = Object.entries(murdererCount).reduce(topReducer, []);
		topDeathMap = Object.entries(deathMapCount).reduce(topReducer, []);
	}

	const table = new AsciiTable(
		`Stats for ${interaction.data.resolved.users[options[0].value].username}`
	);

	table.setAlign(0, AsciiTable.LEFT).setAlign(1, AsciiTable.LEFT).setJustify();

	table.addRow("K/D", (result.kills.length || 1) / (result.deaths.length || 1));
	table.addRow(" ", " ");

	table.addRow("Kills", result.kills.length);
	if (result.kills.length) {
		table.addRow("> Favorite Prey", `${topVictim[0]} (${topVictim[1]})`);
		table.addRow(
			"> Favorite Location",
			`${topMurderMap[0]} (${topMurderMap[1]})`
		);
	}

	table.addRow(" ", " ");

	table.addRow("Deaths", result.deaths.length);
	if (result.deaths.length) {
		table.addRow(
			'> Most Murderous "Friend"',
			`${topMurderer[0]} (${topMurderer[1]})`
		);
		table.addRow(
			"> Deadliest Location",
			`${topDeathMap[0]} (${topDeathMap[1]})`
		);
	}

	client.api.interactions(interaction.id, interaction.token).callback.post({
		data: {
			type: 4,
			data: { content: `\`\`\`${table.toString()}\`\`\`` },
		},
	});
};
