import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { isNil } from 'lodash';
import { BotCommandEvent } from './events/bot-command.event';
import { BotGlobalEvent } from './events/bot-global.event';

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

		new BotGlobalEvent(this.client);
		new BotCommandEvent(this.client);
		this.client.login(this.token);
	}
}

new DiscordClient();
