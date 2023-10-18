import { ChatInputCommandInteraction, Client, CommandInteractionOption } from 'discord.js';
import { isArray, isNil } from 'lodash';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { MissionOptions } from '../enums/mission-option.enum';
import { WordUtils } from '../utils/word.utils';

export class EnabledMissionCommandService implements ICommand<CommandInteractionOption[]> {
	constructor(
		private client: Client,
		private prismaService: PrismaService,
		private interaction: ChatInputCommandInteraction,
	) {}

	public async execute(options: CommandInteractionOption[]): Promise<void> {
		const optChannel = options?.find((opt) => opt.name === MissionOptions.CHANNEL) as CommandInteractionOption;

		const alreadyExist = await this.prismaService.missions.findFirst({
			where: {
				userId: this.interaction.user.id,
				channelId: optChannel.value as string,
			},
		});

		if (!isNil(alreadyExist)) {
			const newWords = WordUtils.getWords(options.find((e) => e.name === MissionOptions.WORDS)?.value as string);
			const newForbiddenWords = WordUtils.getWords(
				options.find((e) => e.name === MissionOptions.FORBIDDEN_WORDS)?.value as string,
			);

			let words: string[] = isArray(newWords) ? newWords : [newWords];
			let forbiddenWords: string[] = isArray(newForbiddenWords) ? newForbiddenWords : [newForbiddenWords];

			await this.prismaService.missions.update({
				where: {
					id: alreadyExist.id,
				},
				data: { words, forbiddenWords },
			});
		} else {
			await this.prismaService.missions.create({
				data: {
					createdAt: new Date(),
					updatedAt: new Date(),
					userId: this.interaction.user.id,
					channelId: optChannel.value?.toString() as string,
					channelName: (
						this.client.channels.cache.find((channel: any) => channel.id === optChannel.value) as any
					)?.name,
					words: WordUtils.getWords(options.find((e) => e.name === MissionOptions.WORDS)?.value as string),
					forbiddenWords: WordUtils.getWords(
						options.find((e) => e.name === MissionOptions.FORBIDDEN_WORDS)?.value as string,
					),
				},
			});
		}

		await this.interaction.reply({
			content: '🚀 Notification mission enabled',
			fetchReply: true,
			ephemeral: true,
		});
	}
}
