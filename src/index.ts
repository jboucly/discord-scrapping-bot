import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { isNil } from 'lodash';
import { BotEvent } from './events/bot-event';

export class DiscordClient {
	public client!: Client;

	private token = process.env.TOKEN || null;

	constructor() {
		this.createClient();
		this.runBot();
	}

	private createClient(): void {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.MessageContent,
			],
		});
	}

	private runBot(): void {
		if (isNil(this.token)) throw new Error('Token is null');

		new BotEvent(this.client);
		this.client.login(this.token);
	}
}

new DiscordClient();

// const collections = new Collection();
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// const commandsPath = join(__dirname, 'commands');
// const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

// for (const file of commandFiles) {
// 	const filePath = join(commandsPath, file);
// 	const command = require(filePath);

// 	if ('data' in command && 'execute' in command) {
// 		collections.set(command.data.name, command);
// 	} else {
// 		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// 	}
// }

// // —————— EVENT ——————————————————————————————————————————————————————————————————————————————————————————————————————

// client.once(Events.ClientReady, (c) => {
// 	console.log(`Ready! Logged in as ${c.user.tag}`);
// });

// const prefix = '!';

// client.on('message', function (message) {
// 	if (message.author.bot) return;
// 	if (!message.content.startsWith(prefix)) return;

// 	const commandBody = message.content.slice(prefix.length);
// 	const args = commandBody.split(' ');
// 	const command = args.shift().toLowerCase();

// 	if (command === 'ping') {
// 		const timeTaken = Date.now() - message.createdTimestamp;
// 		message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
// 	}
// });

// // client.on(Events.InteractionCreate, async (interaction) => {
// // 	console.log('[INTERACTION] - ', interaction);

// // 	if (!interaction.isChatInputCommand()) return;
// // 	const command = collections.get(interaction.commandName);

// // 	if (!command) {
// // 		console.error(`No command matching ${interaction.commandName} was found.`);
// // 		return;
// // 	}

// // 	try {
// // 		await (command as any).execute(interaction);
// // 	} catch (error) {
// // 		console.error(error);
// // 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
// // 	}
// // });

// client.login(token);
