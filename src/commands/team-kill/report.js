const { v4 } = require("uuid");
const dayjs = require("dayjs");
const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");
const {
	OPTION_TEAMKILL_MURDERER,
	OPTION_TEAMKILL_VICTIM,
	OPTION_TEAMKILL_MAP,
	OPTION_TEAMKILL_INFO,
	OPTION_TEAMKILL_DATE,
} = require("../../constants/options");

const getUser = (interaction, userId) => ({
	id: userId,
	displayName: interaction.data.resolved.users[userId].username,
});

module.exports = (client, interaction, options) => {
	const report = options.reduce(
		(acc, option) => ({ ...acc, [option.name]: option.value }),
		{}
	);

	if (
		!report[OPTION_TEAMKILL_MURDERER] ||
		!report[OPTION_TEAMKILL_VICTIM] ||
		!report[OPTION_TEAMKILL_MAP]
	) {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: { content: "Report is missing information" },
			},
		});

		return;
	}

	const date = dayjs(report[OPTION_TEAMKILL_DATE] || undefined);
	if (!date.isValid()) {
		client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 4,
				data: { content: "The inserted date is invalid" },
			},
		});

		return;
	}

	getDatabaseInstance()
		.get(TABLE_TEAMKILLS)
		.push({
			id: v4(),
			timestamp: date.unix(),
			map: report[OPTION_TEAMKILL_MAP],
			murderer: getUser(interaction, report[OPTION_TEAMKILL_MURDERER]),
			victim: getUser(interaction, report[OPTION_TEAMKILL_VICTIM]),
			info: report[OPTION_TEAMKILL_INFO],
		})
		.write();

	client.api.interactions(interaction.id, interaction.token).callback.post({
		data: {
			type: 4,
			data: { content: "Report added, cheeki breeki!" },
		},
	});
};
