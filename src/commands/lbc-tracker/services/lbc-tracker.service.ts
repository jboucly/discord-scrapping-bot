import { ICommand } from '@common/interfaces/command.interface';
import { CommandOptionsUtils } from '@common/utils/command-options.utils';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { LBCTrackerType } from '../enums/lbc-tracker-type.enum';
import { LBCTrackerSearchDisabledService } from './lbc-tracker-disabled.service';
import { LBCTrackerEnabledService } from './lbc-tracker-enabled.service';
import { LBCTrackerListService } from './lbc-tracker-list.service';
import { LBCTrackerUpdateService } from './lbc-tracker-update.service';

export class LBCTrackerService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction,

		private readonly lbcTrackerEnabledService = new LBCTrackerEnabledService(interaction),
		private readonly lbcTrackerListService = new LBCTrackerListService(client, interaction),
		private readonly lbcTrackerUpdateService = new LBCTrackerUpdateService(client, interaction),
		private readonly lbcTrackerDisabledService = new LBCTrackerSearchDisabledService(client, interaction)
	) {}

	public async execute(): Promise<void> {
		const list = CommandOptionsUtils.getNotRequired(this.interaction, LBCTrackerType.LIST);
		const update = CommandOptionsUtils.getNotRequired(this.interaction, LBCTrackerType.UPDATE);
		const enabled = CommandOptionsUtils.getNotRequired(this.interaction, LBCTrackerType.ENABLED);
		const disabled = CommandOptionsUtils.getNotRequired(this.interaction, LBCTrackerType.DISABLED);

		if (enabled?.name === LBCTrackerType.ENABLED && enabled?.options) {
			return await this.lbcTrackerEnabledService.execute(enabled.options);
		} else if (disabled?.name === LBCTrackerType.DISABLED) {
			return await this.lbcTrackerDisabledService.execute();
		} else if (list?.name === LBCTrackerType.LIST) {
			return await this.lbcTrackerListService.execute();
		} else if (update?.name === LBCTrackerType.UPDATE) {
			return await this.lbcTrackerUpdateService.execute();
		}
	}
}
