import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
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

const MissionCommand = {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Configure your mission notification. If you search freelancer job, you can use this ! 🔥')
		.addBooleanOption((opts) =>
			opts
				.setRequired(true)
				.setName(MissionOptions.ENABLED)
				.setDescription('Enable or disable the mission notification'),
		)
		.addStringOption((opts) => opts.setName(MissionOptions.WORDS).setDescription('Set keyword to search mission'))
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const prisma = new PrismaService();
		const optEnabled = CommandOptionsUtils.getRequired(interaction, MissionOptions.ENABLED);
		const optWords = CommandOptionsUtils.getNotRequired(interaction, MissionOptions.WORDS);

		const channel = interaction.channel;
		if (isNil(channel)) throw new Error('Channel not found');

		const alreadyExist = await prisma.missions.findFirst({
			where: {
				channelId: channel.id,
			},
		});

		if (optEnabled.value === false) {
			if (!isNil(alreadyExist)) {
				await prisma.missions.delete({
					where: {
						id: alreadyExist.id,
					},
				});
			}
			await interaction.reply({ content: '🚀 Notification mission removed', fetchReply: true });
			return;
		} else if (isNil(optWords)) {
			await interaction.reply({ content: '🚀 Please input keyword', fetchReply: true });
			return;
		} else {
			if (!isNil(alreadyExist)) {
				const newWords = getWords(optWords.value as string);

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
			} else {
				await prisma.missions.create({
					data: {
						createdAt: new Date(),
						updatedAt: new Date(),
						channelId: channel.id,
						channelName: (channel as any)['name'],
						words: getWords(optWords.value as string),
					},
				});
			}

			const message = await interaction.reply({ content: '🚀 Notification mission enabled', fetchReply: true });
			await SetDevBotReact(client, message);
		}
	},
};

export default MissionCommand;
