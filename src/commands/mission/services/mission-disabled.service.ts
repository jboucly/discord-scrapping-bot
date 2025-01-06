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
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';

export class MissionDisabledCommandService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly prismaService: PrismaService,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const allMissionSaved = await this.prismaService.missions.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (allMissionSaved.length === 0) {
			await this.interaction.reply({
				content: 'You have no mission notification configured',
				ephemeral: true
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('removeMissionSelect')
			.setPlaceholder('Select a mission to remove')
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
				})
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			ephemeral: true,
			components: [actionRow as any],
			content: 'Choose mission to remove :'
		});

		await this.setSelectEvent(response);
	}

	private async setSelectEvent(response: InteractionResponse<boolean>): Promise<void> {
		const confirmation = (await response.awaitMessageComponent({
			filter: (i) => i.user.id === this.interaction.user.id,
			time: 60000
		})) as StringSelectMenuInteraction;

		try {
			const missionIdToRemove = Number(confirmation.values[0]);

			if (isNumber(Number(missionIdToRemove)) && !isNaN(missionIdToRemove)) {
				await this.prismaService.missions.deleteMany({
					where: {
						id: missionIdToRemove
					}
				});

				await confirmation.update({
					content: '🚀 Notification mission removed',
					components: []
				});
			}
		} catch (e) {
			await confirmation.update({
				content: 'Confirmation not received within 1 minute, cancelling',
				components: []
			});
			return;
		}
	}
}
