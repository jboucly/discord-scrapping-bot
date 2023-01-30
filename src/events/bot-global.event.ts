import { Client, Events } from 'discord.js';

export class BotGlobalEvent {
	public prefix = '/';

	private webhookUrl = process.env.WEBHOOK_URL || null;

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
			if (!message.content.startsWith(this.prefix)) return;

			const commandBody = message.content.slice(this.prefix.length);
			const args = commandBody.split(' ');
			const command = (args.shift() as string).toLowerCase();

			if (command === 'ping') {
				const timeTaken = Date.now() - message.createdTimestamp;
				message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
			}
		});
	}
}
