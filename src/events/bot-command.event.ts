import { Client, Collection, Events, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Commands } from '../commands';
import { DailyCommandService } from '../commands/daily/services/daily-command.service';
import { MissionCommandService } from '../commands/mission/services/mission-command.service';

export class BotCommandEvent {
	private collection!: Collection<
		string,
		{
			data: RESTPostAPIChatInputApplicationCommandsJSONBody;
			execute: (interaction: any, client: Client) => Promise<void>;
		}
	>;

	constructor(
		private client: Client,
		private dailyCommandService: DailyCommandService = new DailyCommandService(),
		private missionCommandService: MissionCommandService = new MissionCommandService(),
	) {
		this.setCollection();
		this.setCommandEvent();
	}

	private setCollection(): void {
		this.collection = new Collection();

		Commands.forEach((c) => {
			this.collection.set(c.data.name, c);

			switch (c.data.name) {
				case 'daily':
					// If the command is daily, start the cron jobs
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
					ephemeral: true,
				});
			}
		});
	}
}
