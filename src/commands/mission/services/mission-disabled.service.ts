import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	Client,
	InteractionResponse,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { isNumber } from 'lodash';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { SetDevBotReact } from '../../../common/utils/react.utils';

export class MissionDisabledCommandService implements ICommand {
	constructor(
		private client: Client,
		private prismaService: PrismaService,
		private interaction: ChatInputCommandInteraction,
	) {}

	public async execute(): Promise<void> {
		const allMissionSaved = await this.prismaService.missions.findMany();

		if (allMissionSaved.length === 0) {
			await this.interaction.reply({
				content: 'You have no mission notification configured',
				ephemeral: true,
			});
			return;
		}

		const selectInput = new StringSelectMenuBuilder()
			.setCustomId('removeDailySelect')
			.setPlaceholder('Select a daily to remove')
			.addOptions(
				allMissionSaved.map((mission) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(`Channel : ${mission.channelName}`)
						.setDescription(`Words : ${mission.words.join(', ')}`)
						.setValue(mission.id.toString()),
				),
			);

		const actionRow = new ActionRowBuilder().addComponents(selectInput);

		const response = await this.interaction.reply({
			content: 'Choose daily to remove :',
			components: [actionRow as any],
		});

		await this.setSelectEvent(response);
	}

	private async setSelectEvent(response: InteractionResponse<boolean>): Promise<void> {
		try {
			const confirmation = (await response.awaitMessageComponent({
				filter: (i) => i.user.id === this.interaction.user.id,
				time: 60000,
			})) as StringSelectMenuInteraction;

			const missionIdToRemove = Number(confirmation.values[0]);

			if (isNumber(Number(missionIdToRemove)) && !isNaN(missionIdToRemove)) {
				await this.prismaService.missions.deleteMany({
					where: {
						id: missionIdToRemove,
					},
				});

				const res = await this.interaction.editReply({
					content: '🚀 Notification mission removed',
					components: [],
				});
				await SetDevBotReact(this.client, res);
				return;
			}

			await this.interaction.editReply({
				content: 'Error while removing notification mission',
				components: [],
			});
			return;
		} catch (e) {
			await this.interaction.editReply({
				content: 'Confirmation not received within 1 minute, cancelling',
				components: [],
			});
			return;
		}
	}
}
