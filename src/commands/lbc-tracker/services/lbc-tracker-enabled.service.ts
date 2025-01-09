import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { isValidHttpUrl } from '@common/utils/string.utils';
import { CacheType, ChatInputCommandInteraction, CommandInteractionOption } from 'discord.js';
import { isNil } from 'lodash';
import { LBCTrackerOption } from '../enums/lbc-tracker-option.enum';

export class LBCTrackerEnabledService implements ICommand {
	constructor(private readonly interaction: ChatInputCommandInteraction) {}

	public async execute(optChannel: readonly CommandInteractionOption<CacheType>[]): Promise<void> {
		const channelId = optChannel.find((e) => e.name === LBCTrackerOption.CHANNEL)?.value as string;
		const name = optChannel.find((e) => e.name === LBCTrackerOption.NAME)?.value as string;
		const urlToSearch = optChannel.find((e) => e.name === LBCTrackerOption.URL)?.value as string;

		const alreadyExist = await prismaClient.lbcTracker.findFirst({
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
			await prismaClient.lbcTracker.update({
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
			await prismaClient.lbcTracker.create({
				data: {
					channelId,
					name: name,
					url: urlToSearch,
					userId: this.interaction.user.id
				}
			});
		}

		await this.interaction.reply({
			content: `🚀 Notification for search lbc tracker enabled with name : ${name}`,
			flags: 'Ephemeral',
			withResponse: true
		});
	}
}
