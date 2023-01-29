import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { isNil } from 'lodash';
import { BotEvent } from './events/bot-event';
import { BotCommand } from './events/bot-command';

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
		new BotCommand(this.client);
		this.client.login(this.token);
	}
}

new DiscordClient();
