import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { LbcTracker } from '@prisma/client';
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

export class LBCTrackerUpdateService implements ICommand {
	private modalId: string;
	private realEstateToUpdate: LbcTracker;

	private readonly modalInputId = {
		name: 'nameInput',
		url: 'urlInput'
	};

	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const allLbctrackerSaved = await prismaClient.lbcTracker.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (allLbctrackerSaved.length === 0) {
			await this.interaction.reply({
				content: '❌ You have no lbc tracker notification configured',
				ephemeral: true
			});
			return;
		}

		console.log(
			allLbctrackerSaved.map((lbcTracker) => {
				return new StringSelectMenuOptionBuilder()
					.setDescription(`Name : ${lbcTracker.name}`)
					.setEmoji('🏠')
					.setValue(`${lbcTracker.id}`);
			})
		);

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('updateRealEstateSelect')
			.setPlaceholder('Select a lbc tracker to update')
			.addOptions(
				allLbctrackerSaved.map((realEstate) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(`Name : ${realEstate.name}`)
						.setDescription(
							`Url : ${realEstate.url.length > 100 ? realEstate.url.slice(0, 80) + '...' : realEstate.url}`
						)
						.setEmoji('🏠')
						.setValue(`${realEstate.id}`)
				)
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			flags: 'Ephemeral',
			components: [actionRow as any],
			content: 'Choose lbc tracker to update :'
		});

		await this.setSelectEvent(response);
	}

	private async setSelectEvent(response: InteractionResponse<boolean>): Promise<void> {
		const selectMenuInteraction = (await response.awaitMessageComponent({
			filter: (i) => i.user.id === this.interaction.user.id,
			time: 60000
		})) as StringSelectMenuInteraction;

		try {
			const realEstateIdToUpdate = Number(selectMenuInteraction.values[0]);
			const realEstataToUpdate = await prismaClient.lbcTracker.findUnique({
				where: {
					id: realEstateIdToUpdate
				}
			});

			if (!realEstataToUpdate) throw new Error('Real estate not found');
			this.realEstateToUpdate = realEstataToUpdate;

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

		const modal = new ModalBuilder().setCustomId(this.modalId).setTitle('Update lbc tracker notification');

		const realEstateNameInput = new TextInputBuilder()
			.setCustomId(this.modalInputId.name)
			.setLabel('Set name of your notification')
			.setValue(this.realEstateToUpdate.name)
			.setRequired(true)
			.setPlaceholder('My real estate')
			.setStyle(TextInputStyle.Short);

		const realEstateUrlInput = new TextInputBuilder()
			.setCustomId(this.modalInputId.url)
			.setLabel('Set url of your notification')
			.setValue(this.realEstateToUpdate.url)
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

		await prismaClient.lbcTracker.update({
			where: {
				id: this.realEstateToUpdate.id
			},
			data: { name, url }
		});

		await modalInteraction.reply({
			flags: 'Ephemeral',
			withResponse: true,
			content: '🚀 Notification lbc tracker updated'
		});
	}
}
