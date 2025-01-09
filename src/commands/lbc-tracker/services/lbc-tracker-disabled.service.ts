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

export class LBCTrackerSearchDisabledService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const allSearchSaved = await prismaClient.lbcTracker.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (allSearchSaved.length === 0) {
			await this.interaction.reply({
				flags: 'Ephemeral',
				content: '❌ You have no search lbc tracker notification configured'
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('removelbcTrackerSelect')
			.setPlaceholder('Select a lbc tracker to remove')
			.addOptions(
				allSearchSaved.map((realEstate) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(
							`Channel : ${(this.client.channels.cache.find((channel) => channel.id === realEstate.channelId) as any)?.name}`
						)
						.setDescription(realEstate.name)
						.setValue(realEstate.id.toString())
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
			const realEstateIdToRemove = Number(confirmation.values[0]);

			if (isNumber(realEstateIdToRemove) && !isNaN(realEstateIdToRemove)) {
				await prismaClient.lbcTracker.deleteMany({
					where: {
						id: realEstateIdToRemove
					}
				});

				await confirmation.update({
					content: '🚀 Notification lbc tracker removed',
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
