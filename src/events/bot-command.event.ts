import { Client, Collection, Events, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Commands } from '../commands';
import { DailyCommandEvent } from '../commands/daily/events/daily-command.event';
import { MissionCommandEvent } from '../commands/mission/events/mission-command.event';

export class BotCommandEvent {
	private collection!: Collection<
		string,
		{
			data: RESTPostAPIChatInputApplicationCommandsJSONBody;
			execute: (interaction: any, client: Client) => Promise<void>;
		}
	>;

	constructor(
		private readonly client: Client,
		private readonly dailyCommandService: DailyCommandEvent = new DailyCommandEvent(),
		private readonly missionCommandService: MissionCommandEvent = new MissionCommandEvent()
	) {}

	public init(): void {
		this.setCollection();
		this.setCommandEvent();
	}

	private setCollection(): void {
		this.collection = new Collection();

		Commands.forEach((c) => {
			this.collection.set(c.data.name, c);

			// Start cron jobs
			switch (c.data.name) {
				case 'daily':
					this.dailyCommandService.startCronJobs(this.client);
					break;
				case 'mission':
					this.missionCommandService.startCronJobs(this.client);
					break;
			}
		});
	}

	private setCommandEvent(): void {
		this.client.on(Events.InteractionCreate, async (interaction) => {
			if (!interaction.isChatInputCommand()) return;
			const command = this.collection.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await (command as any).execute(interaction, this.client);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				});
			}
		});
	}
}
