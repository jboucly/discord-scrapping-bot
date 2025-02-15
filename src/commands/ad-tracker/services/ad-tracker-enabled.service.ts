import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { AdTrackerRepository } from '@common/repositories/adTracker.repository';
import { isValidHttpUrl } from '@common/utils/string.utils';
import { AdTrackers, AdTrackerType } from '@prisma/client';
import { CacheType, ChatInputCommandInteraction, CommandInteractionOption } from 'discord.js';
import { isNil } from 'lodash';
import { AdTrackerOption } from '../enums/ad-tracker-option.enum';
import { constructMotorImmoModal } from '../utils/ad-tracker-modal.utils';
import { CheckUrlAdTrackerUtil } from '../utils/check-url-ad-tracker.util';

export class AdTrackerEnabledService implements ICommand {
	private modalId: string;
	private readonly adTrackerRepository = new AdTrackerRepository();

	constructor(private readonly interaction: ChatInputCommandInteraction) {}

	public async execute(optChannel: readonly CommandInteractionOption<CacheType>[]): Promise<void> {
		const channelId = optChannel.find((e) => e.name === AdTrackerOption.CHANNEL)?.value as string;
		const name = optChannel.find((e) => e.name === AdTrackerOption.NAME)?.value as string;
		const urlToSearch = optChannel.find((e) => e.name === AdTrackerOption.URL)?.value as string | undefined;
		const type = optChannel.find((e) => e.name === AdTrackerOption.TYPE)?.value as AdTrackerType;

		const alreadyExist = await this.adTrackerRepository.findAdTrackerByUserIdAndName(
			this.interaction.user.id,
			name
		);

		if (type === AdTrackerType.MOTEUR_IMMO) {
			await this.launchLogicToSaveMotorsImmo(name, channelId, alreadyExist as AdTrackers);
		} else {
			if ((!urlToSearch && !isValidHttpUrl(urlToSearch)) || !CheckUrlAdTrackerUtil(urlToSearch, type)) {
				await this.interaction.reply({
					content: `❌ Invalid URL to search : ${urlToSearch}`,
					flags: 'Ephemeral',
					withResponse: true
				});
				return;
			}

			if (!isNil(alreadyExist)) {
				await prismaClient.adTrackers.update({
					where: {
						id: alreadyExist.id
					},
					data: {
						name,
						type,
						url: urlToSearch,
						userId: this.interaction.user.id
					}
				});
			} else {
				await prismaClient.adTrackers.create({
					data: {
						type,
						channelId,
						name: name,
						url: urlToSearch as string,
						userId: this.interaction.user.id
					}
				});
			}

			await this.interaction.reply({
				content: `🚀 Notification for search ad tracker enabled with name : ${name}`,
				flags: 'Ephemeral',
				withResponse: true
			});
		}
	}

	private async launchLogicToSaveMotorsImmo(name: string, channelId: string, adTrackerExist: AdTrackers | undefined) {
		this.modalId = `adTrackerMotorImmoModal-${this.interaction.user.id}`;

		const modal = constructMotorImmoModal(this.modalId);
		await this.interaction.showModal(modal);

		const modalInteraction = await this.interaction.awaitModalSubmit({
			filter: (interaction) =>
				interaction.customId === this.modalId && interaction.user.id === this.interaction.user.id,
			time: 60000
		});

		const query = modalInteraction.fields.getTextInputValue('adTrackerJSON');

		await this.adTrackerRepository.saveOrUpdateAdTrackerMotorImmo(
			{
				id: adTrackerExist ? adTrackerExist.id : undefined,
				name: name,
				channelId: channelId,
				url: 'https://moteurimmo.fr/',
				type: AdTrackerType.MOTEUR_IMMO,
				userId: this.interaction.user.id
			},
			query
		);

		await modalInteraction.reply({
			flags: 'Ephemeral',
			withResponse: true,
			content: '🚀 Ad tracker saved'
		});
	}
}
