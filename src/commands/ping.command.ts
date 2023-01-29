import { SlashCommandBuilder } from 'discord.js';

const command = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').toJSON(),
	async execute(interaction: any) {
		await interaction.reply('Pong!');
	},
};

export default command;
