import { Client, SlashCommandBuilder } from 'discord.js';

const pingCommand = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').toJSON(),
	async execute(interaction: any, _client: Client) {
		await interaction.reply('Pong!');
	}
};

export default pingCommand;
