import { Missions } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isArray, isNil } from 'lodash';
import { PrismaService } from '../../common/services/prisma.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { SetDevBotReact } from '../../common/utils/react.utils';
import { MissionOptions } from './enums/mission-option.enum';

function getWords(words: string): string[] {
	if (words.includes(',') || words.includes(' ')) {
		return words.split(/,|\s/).filter((w) => w !== '');
	}

	return [words];
}

function createEmbeds(missions: Missions[]): EmbedBuilder[] {
	const valToReturn: EmbedBuilder[] = [];

	missions.forEach((mission) => {
		const embed = new EmbedBuilder()
			.setColor('#006F62')
			.setTitle(`Channel : ${mission.channelName}`)
			.setDescription(`Words : ${mission.words.join(', ')}`)
			.setTimestamp(mission.updatedAt);

		valToReturn.push(embed);
	});

	return valToReturn;
}

const MissionCommand = {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Configure your mission notification. If you search freelancer job, you can use this ! 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(MissionOptions.ENABLED)
				.setDescription('Enable mission notification')
				.addStringOption((opts) =>
					opts
						.setName(MissionOptions.WORDS)
						.setDescription('Set keyword to search mission')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(MissionOptions.DISABLED).setDescription('Disable mission notification'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(MissionOptions.LIST).setDescription('Get your mission notification configured'),
		)
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const prisma = new PrismaService();

		const isEnabled = CommandOptionsUtils.getNotRequired(interaction, MissionOptions.ENABLED);
		const isMissionList = !isNil(CommandOptionsUtils.getNotRequired(interaction, MissionOptions.LIST));
		const isDisabled = !isNil(CommandOptionsUtils.getNotRequired(interaction, MissionOptions.DISABLED));

		const channel = interaction.channel;
		if (isNil(channel)) throw new Error('Channel not found');

		const alreadyExist = await prisma.missions.findFirst({
			where: {
				channelId: channel.id,
			},
		});

		if (isMissionList) {
			const alreadyExist = await prisma.missions.findMany();

			if (isNil(alreadyExist) || alreadyExist.length === 0) {
				const message = await interaction.reply({
					content: 'You have no mission notification configured',
					fetchReply: true,
				});
				await SetDevBotReact(client, message);
				return;
			}

			const message = await interaction.reply({ embeds: createEmbeds(alreadyExist), fetchReply: true });
			await SetDevBotReact(client, message);
		} else if (isDisabled) {
			if (!isNil(alreadyExist)) {
				await prisma.missions.delete({
					where: {
						id: alreadyExist.id,
					},
				});
			}
			const message = await interaction.reply({ content: '🚀 Notification mission removed', fetchReply: true });
			await SetDevBotReact(client, message);
			return;
		} else if (isEnabled && isEnabled.options?.length === 0) {
			const message = await interaction.reply({ content: '🚀 Please input keyword', fetchReply: true });
			await SetDevBotReact(client, message);
			return;
		} else {
			if (isEnabled && !isNil(alreadyExist) && isEnabled.options) {
				const newWords = getWords(
					isEnabled.options.find((e) => e.name === MissionOptions.WORDS)?.value as string,
				);

				if (isArray(newWords)) {
					await prisma.missions.update({
						where: {
							id: alreadyExist.id,
						},
						data: {
							words: newWords,
						},
					});
				} else {
					await prisma.missions.update({
						where: {
							id: alreadyExist.id,
						},
						data: {
							words: [newWords],
						},
					});
				}
			} else if (isEnabled && isEnabled.options) {
				await prisma.missions.create({
					data: {
						createdAt: new Date(),
						updatedAt: new Date(),
						channelId: channel.id,
						channelName: (channel as any)['name'],
						words: getWords(
							isEnabled.options.find((e) => e.name === MissionOptions.WORDS)?.value as string,
						),
					},
				});
			}

			const message = await interaction.reply({ content: '🚀 Notification mission enabled', fetchReply: true });
			await SetDevBotReact(client, message);
		}
	},
};

export default MissionCommand;
