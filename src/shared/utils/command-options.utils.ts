import { ChatInputCommandInteraction } from 'discord.js';

export const CommandOptionsUtils = {
	getRequired(interaction: ChatInputCommandInteraction, name: string) {
		const opts = interaction.options.data.find((e) => e.name === name);

		if (!opts) {
			throw new Error(`Option ${name} not found`);
		}

		return opts;
	},
};
