import { prismaClient } from '@common/clients/prisma.client';
import { CacheType, ChatInputCommandInteraction, Client, CommandInteractionOption } from 'discord.js';
import { isArray, isNil } from 'lodash';
import { MissionOptions } from '../enums/mission-option.enum';
import { WordUtils } from '../utils/word.utils';

export class EnabledMissionCommandService /*implements ICommand*/ {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(optChannel: readonly CommandInteractionOption<CacheType>[]): Promise<void> {
		const channelId = optChannel.find((e) => e.name === MissionOptions.CHANNEL)?.value as string;
		const wordsChoiced = optChannel.find((e) => e.name === MissionOptions.WORDS)?.value as string;
		const forbiddenWordsChoiced = optChannel.find((e) => e.name === MissionOptions.FORBIDDEN_WORDS)
			?.value as string;

		const alreadyExist = await prismaClient.missions.findFirst({
			where: {
				userId: this.interaction.user.id,
				channelId: channelId
			}
		});

		if (!isNil(alreadyExist)) {
			const newWords = WordUtils.getWords(wordsChoiced);
			const newForbiddenWords = WordUtils.getWords(forbiddenWordsChoiced);

			let words: string[] = isArray(newWords) ? newWords : [newWords];
			let forbiddenWords: string[] = isArray(newForbiddenWords) ? newForbiddenWords : [newForbiddenWords];

			await prismaClient.missions.update({
				where: {
					id: alreadyExist.id
				},
				data: { words, forbiddenWords }
			});
		} else {
			await prismaClient.missions.create({
				data: {
					channelId,
					createdAt: new Date(),
					updatedAt: new Date(),
					userId: this.interaction.user.id,
					channelName: (this.client.channels.cache.find((channel: any) => channel.id === channelId) as any)
						?.name,
					words: WordUtils.getWords(wordsChoiced),
					forbiddenWords: WordUtils.getWords(forbiddenWordsChoiced)
				}
			});
		}

		await this.interaction.reply({
			content: '🚀 Notification mission enabled',
			fetchReply: true,
			ephemeral: true,
			withResponse: true
		});
	}
}
