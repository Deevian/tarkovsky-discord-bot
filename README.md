# Tarkovsky Discord Bot

Discord bot mostly developed for internal usage to keep track of team killing between a group of friends that play Escape from Tarkov, but might be useful for anyone else.

## How do I run this?
What a wonderful question. First off, go to the [Discord Developer Portal](https://discord.com/developers/applications) to create a new application for the bot. Whatever name works. From there, make sure to grab the `APPLICATION ID`, `PUBLIC KEY`, and in the left "Bot" tab, get your `TOKEN` and store all of those values in a notepad somewhere, we'll be using them shortly.

Next, you want to invite the bot to your Discord channel. You can use [this link](https://discord.com/api/oauth2/authorize?client_id=<your-application-id>&permissions=2148001856&scope=bot%20applications.commands). Be sure to update the application ID to match the one you grabbed from the developer portal.

After this is done, you can clone the repo, do a `yarn`, and:
* Rename the `config-example.json` to `config.json` and replace the values with the ones you got from the developer portal
* Run `yarn create-commands` to generate the global slash commands for your application;
  * You only need to run this once, and it might take several minutes to be applied
* Run `yarn start`
* Go grab a coffee, 'cause you're done!

Well, not really.

You will probably want to set this up in a remote server with some kind of supervisor on top of it and whatnot.

