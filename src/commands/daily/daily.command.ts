import { Daily } from '@prisma/client';
import { CronJob } from 'cron';
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Client,
	CommandInteractionOption,
	EmbedBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	TextChannel,
} from 'discord.js';
import { isNaN, isNil, isNumber } from 'lodash';
import { PrismaService } from '../../common/services/prisma.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { SetDevBotReact } from '../../common/utils/react.utils';
import { DailyOptionsHoursChoices, DailyOptionsMinutesChoices } from './constants/daily-option-choice.constant';
import { DailyOptions } from './enums/daily-option.enum';

const TransformCrontab = require('cronstrue');

function createEmbeds(daily: Daily[]): EmbedBuilder[] {
	const valToReturn: EmbedBuilder[] = [];

	daily.forEach((d) => {
		const embed = new EmbedBuilder()
			.setColor('#006F62')
			.setTitle(`Channel : ${d.channelName}`)
			.setDescription(`${TransformCrontab.toString(d.crontab, { verbose: true })}.\nWith message: ${d.message}`)
			.setTimestamp(d.updatedAt);

		valToReturn.push(embed);
	});

	return valToReturn;
}

const DailyCommand = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Configure your daily')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(DailyOptions.ENABLED)
				.setDescription('Enable daily notification')
				.addIntegerOption((opts) =>
					opts
						.setName(DailyOptions.HOUR)
						.setDescription('Set hour of daily')
						.setRequired(true)
						.addChoices(...DailyOptionsHoursChoices),
				)
				.addIntegerOption((opts) =>
					opts
						.setName(DailyOptions.MINUTE)
						.setDescription('Set minute of daily')
						.setRequired(true)
						.addChoices(...DailyOptionsMinutesChoices),
				)
				.addStringOption((opts) =>
					opts
						.setRequired(true)
						.setName(DailyOptions.MESSAGE)
						.setDescription('Save the message you want to receive in the daily'),
				)
				.addChannelOption((opts) =>
					opts
						.setRequired(true)
						.setName(DailyOptions.CHANNEL)
						.setDescription('Save the channel you want to receive the daily'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(DailyOptions.DISABLED).setDescription('Disable daily notification'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(DailyOptions.LIST).setDescription('Get your daily notification configured'),
		)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		let isUpdated = false;
		const prisma = new PrismaService();

		const isEnabled = CommandOptionsUtils.getNotRequired(interaction, DailyOptions.ENABLED);
		const isMissionList = !isNil(CommandOptionsUtils.getNotRequired(interaction, DailyOptions.LIST));
		const isDisabled = !isNil(CommandOptionsUtils.getNotRequired(interaction, DailyOptions.DISABLED));

		if (isEnabled) {
			const optHour = isEnabled.options?.find(
				(opt) => opt.name === DailyOptions.HOUR,
			) as CommandInteractionOption;
			const optMin = isEnabled.options?.find(
				(opt) => opt.name === DailyOptions.MINUTE,
			) as CommandInteractionOption;
			const optChannel = isEnabled.options?.find(
				(opt) => opt.name === DailyOptions.CHANNEL,
			) as CommandInteractionOption;
			const optMessage = isEnabled.options?.find(
				(opt) => opt.name === DailyOptions.MESSAGE,
			) as CommandInteractionOption;

			if (isNil(optHour.value) || isNil(optMin.value)) {
				await interaction.reply('❌ The time format is not correct ❌ \n \r');
				return;
			}

			const dailyToSave = {
				time: `00 ${optMin.value} ${optHour.value} * * *`,
				message: optMessage.value as string,
				channelId: optChannel.value as string,
				chanelName: (client.channels.cache.find((channel: any) => channel.id === optChannel.value) as any)
					?.name,
			};

			const res = await prisma.daily.findFirst({
				where: {
					crontab: dailyToSave.time,
					channelId: dailyToSave.channelId,
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
						channelId: dailyToSave.channelId,
						message: dailyToSave.message,
						channelName: dailyToSave.chanelName,
					},
				});
			}

			const cron = new CronJob(dailyToSave.time, async () => {
				const channel = client.channels.cache.find(
					(channel: any) => channel.id === dailyToSave.channelId,
				) as TextChannel;

				if (isNil(channel)) {
					console.error('Channel not found');
					return;
				}

				await channel.send(dailyToSave.message);
			});

			cron.start();

			const message = await interaction.reply({
				content: isUpdated ? '✅ Daily updated' : '✅ Daily configured',
				fetchReply: true,
			});
			await SetDevBotReact(client, message);
		} else if (isMissionList) {
			const alreadyExist = await prisma.daily.findMany();

			if (isNil(alreadyExist) || alreadyExist.length === 0) {
				await interaction.reply({ content: 'You have no daily configured', ephemeral: true });
				return;
			}

			const message = await interaction.reply({ embeds: createEmbeds(alreadyExist), fetchReply: true });
			await SetDevBotReact(client, message);
		} else if (isDisabled) {
			const channel = interaction.channel;
			if (isNil(channel)) throw new Error('Channel not found');

			const allDaily = await prisma.daily.findMany();

			const selectInput = new StringSelectMenuBuilder()
				.setCustomId('removeDailySelect')
				.setPlaceholder('Select a daily to remove')
				.addOptions(
					allDaily.map((daily) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(TransformCrontab.toString(daily.crontab, { verbose: true }))
							.setDescription(daily.message)
							.setValue(daily.id.toString()),
					),
				);

			const actionRow = new ActionRowBuilder().addComponents(selectInput);

			const response = await interaction.reply({
				content: 'Choose daily to remove :',
				components: [actionRow as any],
			});

			try {
				const confirmation = (await response.awaitMessageComponent({
					filter: (i) => i.user.id === interaction.user.id,
					time: 60000,
				})) as StringSelectMenuInteraction;

				const dailyIdToRemove = Number(confirmation.values[0]);

				if (isNumber(Number(dailyIdToRemove)) && !isNaN(dailyIdToRemove)) {
					await prisma.daily.deleteMany({
						where: {
							id: dailyIdToRemove,
						},
					});

					const res = await interaction.editReply({
						content: '🚀 Daily removed',
						components: [],
					});
					await SetDevBotReact(client, res);
					return;
				}

				await interaction.editReply({
					content: 'Error while removing daily',
					components: [],
				});
				return;
			} catch (e) {
				await interaction.editReply({
					content: 'Confirmation not received within 1 minute, cancelling',
					components: [],
				});
				return;
			}
		}
	},
};

export default DailyCommand;
