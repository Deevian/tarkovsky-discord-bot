const fs = require("fs");
const Discord = require("discord.js");
const config = require("../config.json");
const noop = require("./commands/utility/noop");

const setupClient = (client) => {
	client.commands = new Discord.Collection();

	fs.readdirSync(`${__dirname}/commands`).forEach((folder) => {
		const commandFiles = fs
			.readdirSync(`${__dirname}/commands/${folder}`)
			.filter((file) => file.endsWith(".js"));

		commandFiles.forEach((file) => {
			const command = require(`${__dirname}/commands/${folder}/${file}`);

			client.commands.set(`${folder}__${file.replace(".js", "")}`, command);
		});
	});

	return client;
};

const onInteraction = (client, interaction) => {
	const parent = interaction.data.options[0];
	if (!parent) {
		return noop(client, interaction);
	}

	const child = parent.options[0];
	if (!child) {
		return noop(client, interaction);
	}

	const command = client.commands.get(`${parent.name}__${child.name}`);
	if (!command) {
		return noop(client, interaction);
	}

	command(client, interaction, child.options);
};

const main = () => {
	const client = setupClient(new Discord.Client());

	client.ws.on("INTERACTION_CREATE", onInteraction.bind(null, client));

	client.on("ready", () => console.log("Tarkovsky is online!"));
	client.login(config.token);
};

main();
