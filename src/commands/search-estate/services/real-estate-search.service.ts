import { ICommand } from '@common/interfaces/command.interface';
import { CommandOptionsUtils } from '@common/utils/command-options.utils';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { RealEstateSearchType } from '../enums/real-estate-searh-type.enum';
import { RealEstateSearchDisabledService } from './real-estate-search-disabled.service';
import { RealEstateSearchEnabledService } from './real-estate-search-enabled.service';
import { RealEstateSearchListService } from './real-estate-search-list.service';

export class RealEstateSearchService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction,

		private readonly realEstateSearchEnabledService = new RealEstateSearchEnabledService(interaction),
		private readonly realEstateSearchListService = new RealEstateSearchListService(client, interaction),
		private readonly realEstateSearchDisabledService = new RealEstateSearchDisabledService(client, interaction)
	) {}

	public async execute(): Promise<void> {
		const list = CommandOptionsUtils.getNotRequired(this.interaction, RealEstateSearchType.LIST);
		const enabled = CommandOptionsUtils.getNotRequired(this.interaction, RealEstateSearchType.ENABLED);
		const disabled = CommandOptionsUtils.getNotRequired(this.interaction, RealEstateSearchType.DISABLED);

		if (enabled?.name === RealEstateSearchType.ENABLED && enabled?.options) {
			return await this.realEstateSearchEnabledService.execute(enabled.options);
		} else if (disabled?.name === RealEstateSearchType.DISABLED) {
			return await this.realEstateSearchDisabledService.execute();
		} else if (list?.name === RealEstateSearchType.LIST) {
			return await this.realEstateSearchListService.execute();
		}
	}
}
