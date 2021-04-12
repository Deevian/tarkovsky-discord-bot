const { DiscordInteractions } = require("slash-commands");
const config = require("../../config.json");
const slashCommands = require("../../slash-commands.json");

const interaction = new DiscordInteractions({
	applicationId: config.applicationId,
	authToken: config.token,
	publicKey: config.publicKey,
});

const removeExistingCommands = async () => {
	console.log("> Clearing existing commands...");

	const commands = await interaction.getApplicationCommands();
	if (!commands.length) {
		return;
	}

	await Promise.all(
		commands.map(({ id }) => interaction.deleteApplicationCommand(id))
	);

	console.log("> Commands cleared!");
};

const createCommands = async () => {
	console.log("> Adding commands...");

	const response = await Promise.all(
		slashCommands.map((command) =>
			interaction.createApplicationCommand(command)
		)
	);

	if (response[0].errors) {
		console.dir(response);
	} else {
		console.log("> Commands added!");
	}
};

(async () => {
	try {
		await removeExistingCommands();
		await createCommands();
	} catch (e) {
		console.error(e);
	}
})();
