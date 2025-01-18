import { ICommand } from '@common/interfaces/command.interface';
import { CommandOptionsUtils } from '@common/utils/command-options.utils';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { AdTrackerCommandType } from '../enums/ad-tracker-command-type.enum';
import { AdTrackerSearchDisabledService } from './ad-tracker-disabled.service';
import { AdTrackerEnabledService } from './ad-tracker-enabled.service';
import { AdTrackerListService } from './ad-tracker-list.service';
import { AdTrackerUpdateService } from './ad-tracker-update.service';

export class AdTrackerService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction,

		private readonly adTrackerEnabledService = new AdTrackerEnabledService(interaction),
		private readonly adTrackerListService = new AdTrackerListService(client, interaction),
		private readonly adTrackerUpdateService = new AdTrackerUpdateService(client, interaction),
		private readonly adTrackerDisabledService = new AdTrackerSearchDisabledService(client, interaction)
	) {}

	public async execute(): Promise<void> {
		const list = CommandOptionsUtils.getNotRequired(this.interaction, AdTrackerCommandType.LIST);
		const update = CommandOptionsUtils.getNotRequired(this.interaction, AdTrackerCommandType.UPDATE);
		const enabled = CommandOptionsUtils.getNotRequired(this.interaction, AdTrackerCommandType.ENABLED);
		const disabled = CommandOptionsUtils.getNotRequired(this.interaction, AdTrackerCommandType.DISABLED);

		if (enabled?.name === AdTrackerCommandType.ENABLED && enabled?.options) {
			return await this.adTrackerEnabledService.execute(enabled.options);
		} else if (disabled?.name === AdTrackerCommandType.DISABLED) {
			return await this.adTrackerDisabledService.execute();
		} else if (list?.name === AdTrackerCommandType.LIST) {
			return await this.adTrackerListService.execute();
		} else if (update?.name === AdTrackerCommandType.UPDATE) {
			return await this.adTrackerUpdateService.execute();
		}
	}
}
