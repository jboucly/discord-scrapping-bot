import { Client, SlashCommandBuilder } from 'discord.js';

const SearchEstate = {
	data: new SlashCommandBuilder()
		.setName('search-estate')
		.setDescription('Configure your search estate search notification. If you search house, you can use this ! 🔥')
		.toJSON(),

	async execute(interaction: any, client: Client) {
		await interaction.reply('Pong!');
	}
};

export default SearchEstate;
