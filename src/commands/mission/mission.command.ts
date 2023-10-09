import { Missions } from '@prisma/client';
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
} from 'discord.js';
import { isArray, isNil, isNumber } from 'lodash';
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
				)
				.addChannelOption((opts) =>
					opts
						.setName(MissionOptions.CHANNEL)
						.setDescription('Set channel to send missions')
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

		if (isMissionList) {
			const alreadyExist = await prisma.missions.findMany();

			if (isNil(alreadyExist) || alreadyExist.length === 0) {
				await interaction.reply({
					content: 'You have no mission notification configured',
					ephemeral: true,
				});
				return;
			}

			const message = await interaction.reply({ embeds: createEmbeds(alreadyExist), fetchReply: true });
			await SetDevBotReact(client, message);
		} else if (isDisabled) {
			const allMissionSaved = await prisma.missions.findMany();

			if (allMissionSaved.length === 0) {
				await interaction.reply({ content: 'You have no mission notification configured', ephemeral: true });
				return;
			}

			const selectInput = new StringSelectMenuBuilder()
				.setCustomId('removeDailySelect')
				.setPlaceholder('Select a daily to remove')
				.addOptions(
					allMissionSaved.map((mission) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(`Channel : ${mission.channelName}`)
							.setDescription(`Words : ${mission.words.join(', ')}`)
							.setValue(mission.id.toString()),
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

				const missionIdToRemove = Number(confirmation.values[0]);

				if (isNumber(Number(missionIdToRemove)) && !isNaN(missionIdToRemove)) {
					await prisma.missions.deleteMany({
						where: {
							id: missionIdToRemove,
						},
					});

					const res = await interaction.editReply({
						content: '🚀 Notification mission removed',
						components: [],
					});
					await SetDevBotReact(client, res);
					return;
				}

				await interaction.editReply({
					content: 'Error while removing notification mission',
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
		} else if (isEnabled && isEnabled.options?.length === 0) {
			const message = await interaction.reply({ content: '🚀 Please input keyword', fetchReply: true });
			await SetDevBotReact(client, message);
			return;
		} else {
			if (isEnabled && isEnabled.options) {
				const optChannel = isEnabled.options?.find(
					(opt) => opt.name === MissionOptions.CHANNEL,
				) as CommandInteractionOption;

				const alreadyExist = await prisma.missions.findFirst({
					where: {
						channelId: optChannel.value as string,
					},
				});

				if (!isNil(alreadyExist)) {
					const newWords = getWords(
						isEnabled.options.find((e) => e.name === MissionOptions.WORDS)?.value as string,
					);

					let words: string[] = isArray(newWords) ? newWords : [newWords];

					await prisma.missions.update({
						where: {
							id: alreadyExist.id,
						},
						data: { words },
					});
				} else {
					await prisma.missions.create({
						data: {
							createdAt: new Date(),
							updatedAt: new Date(),
							channelId: optChannel.value?.toString() as string,
							channelName: (
								client.channels.cache.find((channel: any) => channel.id === optChannel.value) as any
							)?.name,
							words: getWords(
								isEnabled.options.find((e) => e.name === MissionOptions.WORDS)?.value as string,
							),
						},
					});
				}
			}

			const message = await interaction.reply({ content: '🚀 Notification mission enabled', fetchReply: true });
			await SetDevBotReact(client, message);
		}
	},
};

export default MissionCommand;
