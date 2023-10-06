import { CronJob } from 'cron';
import { ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from '../../common/services/prisma.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { DateUtils } from '../../common/utils/date.utils';
import { DailyOptions } from './enums/daily-option.enum';

const DailyCommand = {
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
		const prisma = new PrismaService();
		const optHour = CommandOptionsUtils.getRequired(interaction, DailyOptions.HOUR);
		const optChannel = CommandOptionsUtils.getRequired(interaction, DailyOptions.CHANNEL);
		const optMessage = CommandOptionsUtils.getRequired(interaction, DailyOptions.MESSAGE);

		if (isNil(optHour) || isNil(optHour.value) || !DateUtils.isTimeFormatCorrect(optHour.value as string)) {
			await interaction.reply('❌ The time format is not correct ❌ \n \r ➡️ The correct format is: hh:mm');
			return;
		}

		const crontab = (optHour.value as string).split(':');

		const dailyToSave = {
			time: `00 ${crontab[1]} ${crontab[0]} * * *`,
			channel: optChannel.value as string,
			message: optMessage.value as string,
		};

		const res = await prisma.daily.findFirst({
			where: {
				crontab: dailyToSave.time,
				channelId: dailyToSave.channel,
			},
		});

		if (!isNil(res)) {
			isUpdated = true;
			await prisma.daily.update({
				where: {
					id: res.id,
				},
				data: {
					message: dailyToSave.message,
				},
			});
		} else {
			await prisma.daily.create({
				data: {
					createdAt: new Date(),
					updatedAt: new Date(),
					crontab: dailyToSave.time,
					channelId: dailyToSave.channel,
					message: dailyToSave.message,
				},
			});
		}

		const cron = new CronJob(dailyToSave.time, async () => {
			const channel = client.channels.cache.find(
				(channel: any) => channel.id === dailyToSave.channel
			) as TextChannel;

			if (isNil(channel)) {
				console.error('Channel not found');
				return;
			}

			await channel.send(dailyToSave.message);
		});

		cron.start();

		await interaction.reply(isUpdated ? '✅ Daily updated' : '✅ Daily configured');
	},
};

export default DailyCommand;
