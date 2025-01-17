import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Client,
	InteractionResponse,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder
} from 'discord.js';
import { isNumber } from 'lodash';

export class AdTrackerSearchDisabledService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const allSearchSaved = await prismaClient.adTrackers.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (allSearchSaved.length === 0) {
			await this.interaction.reply({
				flags: 'Ephemeral',
				content: '❌ You have no search ad tracker notification configured'
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('removeAdTrackerSelect')
			.setPlaceholder('Select a ad tracker to remove')
			.addOptions(
				allSearchSaved.map((adToSearch) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(
							`Channel : ${(this.client.channels.cache.find((channel) => channel.id === adToSearch.channelId) as any)?.name}`
						)
						.setDescription(adToSearch.name)
						.setValue(adToSearch.id.toString())
				)
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			flags: 'Ephemeral',
			components: [actionRow as any],
			content: 'Choose lbc tracker to remove :'
		});

		this.setUserResponseEventCallback(response);
	}

	private async setUserResponseEventCallback(response: InteractionResponse<boolean>): Promise<void> {
		const confirmation = (await response.awaitMessageComponent({
			filter: (i) => i.user.id === this.interaction.user.id,
			time: 60000
		})) as StringSelectMenuInteraction;

		try {
			const adTrackerIdToRemove = Number(confirmation.values[0]);

			if (isNumber(adTrackerIdToRemove) && !isNaN(adTrackerIdToRemove)) {
				await prismaClient.adTrackers.deleteMany({
					where: {
						id: adTrackerIdToRemove
					}
				});

				await confirmation.update({
					content: '🚀 Notification ad tracker removed',
					components: []
				});
			}
		} catch (e) {
			await confirmation.update({
				content: '❌ Confirmation not received within 1 minute, cancelling',
				components: []
			});
			return;
		}
	}
}
