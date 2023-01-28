"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordClient = void 0;
require("dotenv/config");
const discord_js_1 = require("discord.js");
const lodash_1 = require("lodash");
const bot_event_1 = require("./events/bot-event");
class DiscordClient {
    constructor() {
        this.token = process.env.TOKEN || null;
        this.createClient();
        this.runBot();
    }
    createClient() {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildBans,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.DirectMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
    }
    runBot() {
        if ((0, lodash_1.isNil)(this.token))
            throw new Error('Token is null');
        new bot_event_1.BotEvent(this.client);
        this.client.login(this.token);
    }
}
exports.DiscordClient = DiscordClient;
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
