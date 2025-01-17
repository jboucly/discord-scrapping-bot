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

export class AdTrackerUpdateService implements ICommand {
	private modalId: string;
	private adToUpdate: AdTrackers;

	private readonly modalInputId = {
		name: 'nameInput',
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

		console.log(
			allAdTrackerSaved.map((adTracker) => {
				return new StringSelectMenuOptionBuilder()
					.setDescription(`Name : ${adTracker.name}`)
					.setEmoji('🏠')
					.setValue(`${adTracker.id}`);
			})
		);

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('updateRealEstateSelect')
			.setPlaceholder('Select a ad tracker to update')
			.addOptions(
				allAdTrackerSaved.map((adTracker) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(`Name : ${adTracker.name}`)
						.setDescription(
							`Url : ${adTracker.url.length > 100 ? adTracker.url.slice(0, 80) + '...' : adTracker.url}`
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

			if (!adTrackerToUpdate) throw new Error('Real estate not found');
			this.adToUpdate = adTrackerToUpdate;

			const modal = this.constructModal();
			await selectMenuInteraction.showModal(modal);
			await this.setModalSubmitEvent();
		} catch (e) {
			await selectMenuInteraction.update({
				content: 'Error while updating real estate',
				components: []
			});
			return;
		}
	}

	private constructModal(): ModalBuilder {
		this.modalId = `updateMissionModal-${this.interaction.user.id}`;

		const modal = new ModalBuilder().setCustomId(this.modalId).setTitle('Update ad tracker notification');

		const realEstateNameInput = new TextInputBuilder()
			.setCustomId(this.modalInputId.name)
			.setLabel('Set name of your notification')
			.setValue(this.adToUpdate.name)
			.setRequired(true)
			.setPlaceholder('My real estate')
			.setStyle(TextInputStyle.Short);

		const realEstateUrlInput = new TextInputBuilder()
			.setCustomId(this.modalInputId.url)
			.setLabel('Set url of your notification')
			.setValue(this.adToUpdate.url)
			.setRequired(true)
			.setPlaceholder('https://www.leboncoin.fr')
			.setStyle(TextInputStyle.Short);

		const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(realEstateNameInput);
		const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(realEstateUrlInput);

		modal.addComponents(actionRow1, actionRow2);

		return modal;
	}

	private async setModalSubmitEvent(): Promise<void> {
		const modalInteraction = await this.interaction.awaitModalSubmit({
			filter: (interaction) =>
				interaction.customId === this.modalId && interaction.user.id === this.interaction.user.id,
			time: 60000
		});

		const name = modalInteraction.fields.getTextInputValue(this.modalInputId.name);
		const url = modalInteraction.fields.getTextInputValue(this.modalInputId.url);

		await prismaClient.adTrackers.update({
			where: {
				id: this.adToUpdate.id
			},
			data: { name, url }
		});

		await modalInteraction.reply({
			flags: 'Ephemeral',
			withResponse: true,
			content: '🚀 Notification ad tracker updated'
		});
	}
}
