import { ICommand } from '@common/interfaces/command.interface';
import { prismaClient } from '@common/services/prisma.service';
import { isValidHttpUrl } from '@common/utils/string.utils';
import { CacheType, ChatInputCommandInteraction, CommandInteractionOption } from 'discord.js';
import { isNil } from 'lodash';
import { RealEstateSearchOption } from '../enums/real-estate-search-option.enum';

export class RealEstateSearchEnabledService implements ICommand {
	private readonly prismaService = prismaClient;

	constructor(private readonly interaction: ChatInputCommandInteraction) {}

	public async execute(optChannel: readonly CommandInteractionOption<CacheType>[]): Promise<void> {
		const channelId = optChannel.find((e) => e.name === RealEstateSearchOption.CHANNEL)?.value as string;
		const name = optChannel.find((e) => e.name === RealEstateSearchOption.NAME)?.value as string;
		const urlToSearch = optChannel.find((e) => e.name === RealEstateSearchOption.URL)?.value as string;

		const alreadyExist = await this.prismaService.realEstate.findFirst({
			where: {
				channelId,
				userId: this.interaction.user.id
			}
		});

		if (!isValidHttpUrl(urlToSearch)) {
			await this.interaction.reply({
				content: `❌ Invalid URL to search : ${urlToSearch}`,
				flags: 'Ephemeral',
				withResponse: true
			});
			return;
		}

		if (!isNil(alreadyExist)) {
			await this.prismaService.realEstate.update({
				where: {
					id: alreadyExist.id
				},
				data: {
					name,
					url: urlToSearch,
					userId: this.interaction.user.id
				}
			});
		} else {
			await this.prismaService.realEstate.create({
				data: {
					channelId,
					name: name,
					url: urlToSearch,
					userId: this.interaction.user.id
				}
			});
		}

		await this.interaction.reply({
			content: `🚀 Notification for search real estate enabled with name : ${name}`,
			flags: 'Ephemeral',
			withResponse: true
		});
	}
}
