import { format } from 'date-fns';
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { isNil } from 'lodash';
import { DailyOptions } from '../enums/daily-option.enum';

const dailyCommand = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Configure your daily')
		.addStringOption((opts) =>
			opts
				.setRequired(true)
				.setName(DailyOptions.HOUR)
				.setDescription('Save the time you want to have the daily. In the format: hh:mm')
		)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction) {
		const optHour = interaction.options.data.find((e) => e.name === DailyOptions.HOUR);
		console.log(optHour);

		if (isNil(optHour) || isNil(optHour.value) || !(optHour.value as string).includes(':')) {
			await interaction.reply('❌ The time format is not correct ❌');
			return;
		}

		const time = format(new Date(), 'hh:mm');
		console.log(time);

		await interaction.reply('WIP');
	},
};

export default dailyCommand;
