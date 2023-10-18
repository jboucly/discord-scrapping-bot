import { Missions } from '@prisma/client';
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
	TextInputStyle,
} from 'discord.js';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { WordUtils } from '../utils/word.utils';

export class UpdateMissionCommandService implements ICommand {
	private modalId!: string;
	private missionToUpdate!: Missions;

	constructor(
		private client: Client,
		private prismaService: PrismaService,
		private interaction: ChatInputCommandInteraction,
	) {}

	public async execute(): Promise<void> {
		const allMissionSaved = await this.prismaService.missions.findMany({
			where: { userId: this.interaction.user.id },
		});

		if (allMissionSaved.length === 0) {
			await this.interaction.reply({
				content: 'You have no mission notification configured',
				ephemeral: true,
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('updateMissionSelect')
			.setPlaceholder('Select a mission to update')
			.addOptions(
				allMissionSaved.map((mission) => {
					const desc = `Words : ${mission.words.join(', ')}`;

					if (mission.forbiddenWords.length > 0) {
						desc.concat(`\n Forbidden words : ${mission.forbiddenWords.join(', ')}`);
					}

					return new StringSelectMenuOptionBuilder()
						.setLabel(`Channel : ${mission.channelName}`)
						.setDescription(desc)
						.setValue(mission.id.toString());
				}),
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			ephemeral: true,
			components: [actionRow as any],
			content: 'Choose mission to update :',
		});

		await this.setSelectEvent(response);
	}

	private async setSelectEvent(response: InteractionResponse<boolean>): Promise<void> {
		const selectMenuInteraction = (await response.awaitMessageComponent({
			filter: (i) => i.user.id === this.interaction.user.id,
			time: 60000,
		})) as StringSelectMenuInteraction;

		try {
			const missionIdToUpdate = Number(selectMenuInteraction.values[0]);
			const missionToUpdate = await this.prismaService.missions.findUnique({
				where: {
					id: missionIdToUpdate,
				},
			});

			if (!missionToUpdate) throw new Error('Mission not found');
			this.missionToUpdate = missionToUpdate;

			const modal = this.constructModal();
			await selectMenuInteraction.showModal(modal);
			await this.setModalSubmitEvent();
		} catch (e) {
			await selectMenuInteraction.update({
				content: 'Error while updating mission',
				components: [],
			});
			return;
		}
	}

	private constructModal(): ModalBuilder {
		const missionWords = this.missionToUpdate.words.join(', ');
		const missionForbiddenWords = this.missionToUpdate.forbiddenWords.join(', ');
		this.modalId = `updateMissionModal-${this.interaction.user.id}`;

		const modal = new ModalBuilder().setCustomId(this.modalId).setTitle('Update mission');

		const missionWordInput = new TextInputBuilder()
			.setCustomId('wordsInput')
			.setLabel('Set words to search mission')
			.setValue(missionWords)
			.setRequired(true)
			.setPlaceholder('Nodejs,Angular,React')
			.setStyle(TextInputStyle.Short);

		const missionForbiddenWordsInput = new TextInputBuilder()
			.setCustomId('ForbiddenWordsInput')
			.setLabel('Set forbidden words to exclude mission')
			.setValue(missionForbiddenWords)
			.setRequired(false)
			.setPlaceholder('java,php')
			.setStyle(TextInputStyle.Short);

		const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(missionWordInput);
		const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(missionForbiddenWordsInput);

		modal.addComponents(actionRow1, actionRow2);

		return modal;
	}

	private async setModalSubmitEvent(): Promise<void> {
		const modalInteraction = await this.interaction.awaitModalSubmit({
			filter: (interaction) =>
				interaction.customId === this.modalId && interaction.user.id === this.interaction.user.id,
			time: 60000,
		});

		const words = modalInteraction.fields.getTextInputValue('wordsInput');
		const forbiddenWords = modalInteraction.fields.getTextInputValue('ForbiddenWordsInput');

		await this.prismaService.missions.update({
			where: {
				id: this.missionToUpdate.id,
			},
			data: {
				words: WordUtils.getWords(words),
				forbiddenWords: WordUtils.getWords(forbiddenWords),
			},
		});

		await modalInteraction.reply({
			ephemeral: true,
			content: '🚀 Notification mission updated',
			fetchReply: true,
		});
	}
}
