import { Client, Events } from 'discord.js';

export class BotGlobalEvent {
	constructor(private client: Client) {
		this.setEventOnRunBot();
		this.setPingEvent();
	}

	private setEventOnRunBot(): void {
		this.client.once(Events.ClientReady, async (c) => {
			console.log(`Ready! Logged in as ${c.user.tag}`);
		});
	}

	/**
	 * @name PingEvent
	 * @description Returns the bot's response time to the user
	 */
	private setPingEvent(): void {
		this.client.on('messageCreate', (message) => {
			if (message.author.bot) return;

			const commandBody = message.content.includes('ping');

			if (commandBody) {
				const timeTaken = Date.now() - message.createdTimestamp;
				message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
			}
		});
	}
}
