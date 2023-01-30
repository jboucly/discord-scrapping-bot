import { Client, Collection, Events, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { Commands } from '../commands';

export class BotCommandEvent {
	private collection!: Collection<
		string,
		{ data: RESTPostAPIChatInputApplicationCommandsJSONBody; execute: (interaction: any) => Promise<void> }
	>;

	constructor(private client: Client) {
		this.setCollection();
		this.setCommandEvent();
	}

	private setCollection(): void {
		this.collection = new Collection();

		Commands.forEach((c) => {
			this.collection.set(c.data.name, c);
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
				await (command as any).execute(interaction);
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
