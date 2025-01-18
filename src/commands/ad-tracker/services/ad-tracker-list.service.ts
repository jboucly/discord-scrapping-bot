import { ICommand } from '@common/interfaces/command.interface';
import { AdTrackers, PrismaClient } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { isNil } from 'lodash';
import { getAdTrackerTypeTranslated } from '../utils/ad-tracker-type.utils';

export class AdTrackerListService implements ICommand {
	private readonly prismaClient = new PrismaClient();

	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const alreadyExist = await this.prismaClient.adTrackers.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await this.interaction.reply({
				flags: 'Ephemeral',
				content: '❌ You have no ad tracker notification configured'
			});
			return;
		}

		await this.interaction.reply({
			flags: 'Ephemeral',
			withResponse: true,
			embeds: this.createEmbeds(alreadyExist)
		});
	}

	private createEmbeds(adTrackers: AdTrackers[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		adTrackers.forEach((adTracker) => {
			const embed = new EmbedBuilder()
				.setColor('#006F62')
				.setTitle(
					`Channel : ${(this.client.channels.cache.find((channel) => channel.id === adTracker.channelId) as any)?.name}`
				)
				.setDescription(
					`
					Name : ${adTracker.name}
					Type : ${getAdTrackerTypeTranslated(adTracker.type)}
					URL : ${adTracker.url}
				`
				)
				.setTimestamp(adTracker.updatedAt);

			valToReturn.push(embed);
		});

		return valToReturn;
	}
}
