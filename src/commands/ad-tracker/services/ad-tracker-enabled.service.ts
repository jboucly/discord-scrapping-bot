import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { isValidHttpUrl } from '@common/utils/string.utils';
import { AdTrackerType } from '@prisma/client';
import { CacheType, ChatInputCommandInteraction, CommandInteractionOption } from 'discord.js';
import { isNil } from 'lodash';
import { AdTrackerOption } from '../enums/ad-tracker-option.enum';
import { CheckUrlAdTrackerUtil } from '../utils/check-url-ad-tracker.util';

export class AdTrackerEnabledService implements ICommand {
	constructor(private readonly interaction: ChatInputCommandInteraction) {}

	public async execute(optChannel: readonly CommandInteractionOption<CacheType>[]): Promise<void> {
		const channelId = optChannel.find((e) => e.name === AdTrackerOption.CHANNEL)?.value as string;
		const name = optChannel.find((e) => e.name === AdTrackerOption.NAME)?.value as string;
		const urlToSearch = optChannel.find((e) => e.name === AdTrackerOption.URL)?.value as string;
		const type = optChannel.find((e) => e.name === AdTrackerOption.TYPE)?.value as AdTrackerType;

		const alreadyExist = await prismaClient.adTrackers.findFirst({
			where: {
				channelId,
				userId: this.interaction.user.id
			}
		});

		if (!isValidHttpUrl(urlToSearch) || !CheckUrlAdTrackerUtil(urlToSearch, type)) {
			await this.interaction.reply({
				content: `❌ Invalid URL to search : ${urlToSearch}`,
				flags: 'Ephemeral',
				withResponse: true
			});
			return;
		}

		if (!isNil(alreadyExist)) {
			await prismaClient.adTrackers.update({
				where: {
					id: alreadyExist.id
				},
				data: {
					name,
					type,
					url: urlToSearch,
					userId: this.interaction.user.id
				}
			});
		} else {
			await prismaClient.adTrackers.create({
				data: {
					type,
					channelId,
					name: name,
					url: urlToSearch,
					userId: this.interaction.user.id
				}
			});
		}

		await this.interaction.reply({
			content: `🚀 Notification for search ad tracker enabled with name : ${name}`,
			flags: 'Ephemeral',
			withResponse: true
		});
	}
}
