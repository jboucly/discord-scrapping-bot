import { Client, GatewayIntentBits } from 'discord.js';
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

	private async runBot(): Promise<void> {
		if (isNil(this.token)) throw new Error('Token is null');

		await this.client.login(this.token);
		new BotGlobalEvent(this.client);
		new BotCommandEvent(this.client);
	}
}
