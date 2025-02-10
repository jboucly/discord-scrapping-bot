import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { AdTrackers } from '@prisma/client';
import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Client,
	InteractionResponse,
	ModalBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle
} from 'discord.js';
import { CheckUrlAdTrackerUtil } from '../utils/check-url-ad-tracker.util';

export class AdTrackerUpdateService implements ICommand {
	private modalId: string;
	private adToUpdate: AdTrackers;

	private readonly modalInputId = {
		url: 'urlInput'
	};

	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const allAdTrackerSaved = await prismaClient.adTrackers.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (allAdTrackerSaved.length === 0) {
			await this.interaction.reply({
				content: '❌ You have no ad tracker notification configured',
				ephemeral: true
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('updateRealEstateSelect')
			.setPlaceholder('Select a ad tracker to update')
			.addOptions(
				allAdTrackerSaved.map((adTracker) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(`Name : ${adTracker.name}`)
						.setDescription(
							`Type : ${adTracker.type} |  Url : ${adTracker.url.length > 100 ? adTracker.url.slice(0, 50) + '...' : adTracker.url}`
						)
						.setEmoji('🏠')
						.setValue(`${adTracker.id}`)
				)
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			flags: 'Ephemeral',
			components: [actionRow as any],
			content: 'Choose ad tracker to update :'
		});

		await this.setSelectEvent(response);
	}

	private async setSelectEvent(response: InteractionResponse<boolean>): Promise<void> {
		const selectMenuInteraction = (await response.awaitMessageComponent({
			filter: (i) => i.user.id === this.interaction.user.id,
			time: 60000
		})) as StringSelectMenuInteraction;

		try {
			const adTrackerIdToUpdate = Number(selectMenuInteraction.values[0]);
			const adTrackerToUpdate = await prismaClient.adTrackers.findUnique({
				where: {
					id: adTrackerIdToUpdate
				}
			});

			if (!adTrackerToUpdate) throw new Error('Ad tracker not found');
			this.adToUpdate = adTrackerToUpdate;

			const modal = this.constructModal();
			await selectMenuInteraction.showModal(modal);
			await this.setModalSubmitEvent();
		} catch (e) {
			await selectMenuInteraction.update({
				content: 'Error while updating ad tracker',
				components: []
			});
			return;
		}
	}

	private constructModal(): ModalBuilder {
		this.modalId = `updateMissionModal-${this.interaction.user.id}`;

		const modal = new ModalBuilder().setCustomId(this.modalId).setTitle('Update ad tracker notification !');

		const adTrackerUrlInput = new TextInputBuilder()
			.setCustomId(this.modalInputId.url)
			.setLabel('Set url of your notification')
			.setValue(this.adToUpdate.url)
			.setRequired(true)
			.setPlaceholder('https://www.leboncoin.fr')
			.setStyle(TextInputStyle.Short);

		const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(adTrackerUrlInput);

		modal.addComponents(actionRow1);

		return modal;
	}

	private async setModalSubmitEvent(): Promise<void> {
		const modalInteraction = await this.interaction.awaitModalSubmit({
			filter: (interaction) =>
				interaction.customId === this.modalId && interaction.user.id === this.interaction.user.id,
			time: 60000
		});

		const url = modalInteraction.fields.getTextInputValue(this.modalInputId.url);

		if (!CheckUrlAdTrackerUtil(url, this.adToUpdate.type)) {
			await modalInteraction.reply({
				flags: 'Ephemeral',
				withResponse: true,
				content: '❌ Url not valid for this type of ad tracker. Please check the url and try again'
			});
		} else {
			await prismaClient.adTrackers.update({
				where: {
					id: this.adToUpdate.id
				},
				data: { url }
			});

			await modalInteraction.reply({
				flags: 'Ephemeral',
				withResponse: true,
				content: '🚀 Notification ad tracker updated'
			});
		}
	}
}
