import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { Commands } from './commands';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commandToDeploy = Commands.map((c) => c.data);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN as string);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commandToDeploy.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(Routes.applicationGuildCommands(CLIENT_ID as string, GUILD_ID as string), {
			body: commandToDeploy
		});

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
