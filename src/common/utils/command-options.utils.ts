import { ChatInputCommandInteraction, CommandInteractionOption } from 'discord.js';

export const CommandOptionsUtils = {
	getRequired(interaction: ChatInputCommandInteraction, name: string): CommandInteractionOption {
		const opts = interaction.options.data.find((e) => e.name === name);

		if (!opts) {
			throw new Error(`Option ${name} not found`);
		}

		return opts;
	},

	getNotRequired(interaction: ChatInputCommandInteraction, name: string): CommandInteractionOption | undefined {
		return interaction.options.data.find((e) => e.name === name);
	},
};
