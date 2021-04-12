const Discord = require("discord.js");

function main(config) {
	const client = new Discord.Client();

	client.login(config.token);
	client.once("ready", () => {
		console.log("All ready to go!");
	});
}

module.exports = main
