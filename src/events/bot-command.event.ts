import { Client, Collection, Events, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Commands } from '../commands';
import { DailyCommandService } from '../shared/services/daily-command.service';

export class BotCommandEvent {
	private collection!: Collection<
		string,
		{
			data: RESTPostAPIChatInputApplicationCommandsJSONBody;
			execute: (interaction: any, client: Client) => Promise<void>;
		}
	>;

	constructor(private client: Client) {
		this.setCollection();
		this.setCommandEvent();
	}

	private setCollection(): void {
		this.collection = new Collection();

		Commands.forEach((c) => {
			this.collection.set(c.data.name, c);

			// If the command is daily, start the cron jobs
			if (c.data.name === 'daily') {
				DailyCommandService.startCronJobs(this.client);
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
