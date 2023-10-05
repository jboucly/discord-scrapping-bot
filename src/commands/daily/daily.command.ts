import { CronJob } from 'cron';
import { ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import JsonStorage from '../../common/services/json-storage.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { DateUtils } from '../../common/utils/date.utils';
import { DailyOptions } from './enums/daily-option.enum';
import { Daily } from './types/daily.types';

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
		.addStringOption((opts) =>
			opts
				.setRequired(true)
				.setName(DailyOptions.MESSAGE)
				.setDescription('Save the message you want to receive in the daily')
		)
		.addChannelOption((opts) =>
			opts
				.setRequired(true)
				.setName(DailyOptions.CHANNEL)
				.setDescription('Save the channel you want to receive the daily')
		)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		let isUpdated = false;
		const optHour = CommandOptionsUtils.getRequired(interaction, DailyOptions.HOUR);
		const optChannel = CommandOptionsUtils.getRequired(interaction, DailyOptions.CHANNEL);
		const optMessage = CommandOptionsUtils.getRequired(interaction, DailyOptions.MESSAGE);

		if (isNil(optHour) || isNil(optHour.value) || !DateUtils.isTimeFormatCorrect(optHour.value as string)) {
			await interaction.reply('❌ The time format is not correct ❌ \n \r ➡️ The correct format is: hh:mm');
			return;
		}

		const crontab = (optHour.value as string).split(':');
		const storage = new JsonStorage('daily.json');

		const daily = {
			time: `00 ${crontab[1]} ${crontab[0]} * * *`,
			channel: optChannel.value as string,
			message: optMessage.value as string,
		};

		const res = (storage.get('cron', true) as Daily[]).find((d) => d.time === daily.time);

		if (!isNil(res)) {
			isUpdated = true;
			const allDaily = storage.get('cron', true) as Daily[];
			const index = allDaily.findIndex((d) => d.time === daily.time);
			allDaily[index] = daily;
			storage.update('cron', allDaily);
		} else {
			storage.set('cron', daily, { isArray: true });
		}

		const cron = new CronJob(daily.time, async () => {
			const channel = client.channels.cache.find((channel: any) => channel.id === daily.channel) as TextChannel;

			if (isNil(channel)) {
				console.error('Channel not found');
				return;
			}

			await channel.send(daily.message);
		});

		cron.start();

		await interaction.reply(isUpdated ? '✅ Daily updated' : '✅ Daily configured');
	},
};

export default dailyCommand;
