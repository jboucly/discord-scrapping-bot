import { Client, Events } from 'discord.js';

export class BotGlobalEvent {
	constructor(private readonly client: Client) {}

	public init(): void {
		this.setEventOnRunBot();
		this.setPingEvent();
	}

	private setEventOnRunBot(): void {
		this.client.once(Events.ClientReady, async (c) => {
			console.log(`ℹ️  Bot ready ! Logged in as ${c.user.tag}`);
		});
	}

	/**
	 * @name PingEvent
	 * @description Returns the bot's response time to the user
	 */
	private setPingEvent(): void {
		this.client.on('messageCreate', (message) => {
			if (message.author.bot) return;

			const pingBody = message.content.includes('ping');
			const whatBody = message.content.includes('quoi');

			if (pingBody) {
				const timeTaken = Date.now() - message.createdTimestamp;
				message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
			}

			if (whatBody) {
				message.reply('Feur');
			}
		});
	}
}
