import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];

// Grab all the command files from the commands directory you created earlier
const commandFiles = readdirSync(__dirname + '/commands').filter((file) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`${__dirname}/commands/${file}`);
	commands.push(command.default.data);
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(TOKEN as string);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(Routes.applicationGuildCommands(CLIENT_ID as string, GUILD_ID as string), {
			body: commands,
		});

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
