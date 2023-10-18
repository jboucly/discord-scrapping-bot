import { ChatInputCommandInteraction, Client, CommandInteractionOption } from 'discord.js';
import { isArray, isNil } from 'lodash';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { SetDevBotReact } from '../../../common/utils/react.utils';
import { MissionOptions } from '../enums/mission-option.enum';

export class EnabledMissionCommandService implements ICommand {
	constructor(
		private client: Client,
		private prismaService: PrismaService,
		private interaction: ChatInputCommandInteraction,
	) {}

	public async sendNoOptionMessage(): Promise<void> {
		const message = await this.interaction.reply({ content: '🚀 Please input keyword', fetchReply: true });
		await SetDevBotReact(this.client, message);
		return;
	}

	public async execute(options: CommandInteractionOption[]) {
		const optChannel = options?.find((opt) => opt.name === MissionOptions.CHANNEL) as CommandInteractionOption;

		const alreadyExist = await this.prismaService.missions.findFirst({
			where: {
				userId: this.interaction.user.id,
				channelId: optChannel.value as string,
			},
		});

		if (!isNil(alreadyExist)) {
			const newWords = this.getWords(options.find((e) => e.name === MissionOptions.WORDS)?.value as string);
			const newForbiddenWords = this.getWords(
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
					words: this.getWords(options.find((e) => e.name === MissionOptions.WORDS)?.value as string),
					forbiddenWords: this.getWords(
						options.find((e) => e.name === MissionOptions.FORBIDDEN_WORDS)?.value as string,
					),
				},
			});
		}

		const message = await this.interaction.reply({
			content: '🚀 Notification mission enabled',
			fetchReply: true,
		});
		await SetDevBotReact(this.client, message);
	}

	private getWords(words: string | undefined): string[] {
		if (isNil(words)) {
			return [];
		}

		if (words.includes(',') || words.includes(' ')) {
			return words.split(/,|\s/).filter((w) => w !== '');
		}

		return [words];
	}
}
