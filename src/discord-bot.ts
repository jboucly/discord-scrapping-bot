import { Client, GatewayIntentBits } from 'discord.js';
import { isNil } from 'lodash';
import { BotCommandEvent } from './events/bot-command.event';
import { BotGlobalEvent } from './events/bot-global.event';

export class DiscordClient {
	public client!: Client;

	private readonly token = process.env.TOKEN ?? null;

	constructor() {
		this.createClient();
	}

	public async init(): Promise<void> {
		await this.runBot();
	}

	private createClient(): void {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildPresences
			]
		});
	}

	private async runBot(): Promise<void> {
		if (isNil(this.token)) throw new Error('Token is null');
		await this.client.login(this.token);

		new BotGlobalEvent(this.client).init();
		new BotCommandEvent(this.client).init();
	}
}
