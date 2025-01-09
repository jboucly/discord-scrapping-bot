import { ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { RealEstateSearchOption } from './enums/real-estate-search-option.enum';
import { RealEstateSearchType } from './enums/real-estate-searh-type.enum';
import { RealEstateSearchService } from './services/real-estate-search.service';

export default {
	data: new SlashCommandBuilder()
		.setName('search-estate')
		.setDescription('Configure your search estate search notification 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(RealEstateSearchType.ENABLED)
				.setDescription('Enable search estate notification')
				.addStringOption((opts) =>
					opts.setName(RealEstateSearchOption.NAME).setDescription('Set name to search').setRequired(true)
				)
				.addChannelOption((opts) =>
					opts
						.setName(RealEstateSearchOption.CHANNEL)
						.setDescription('Set channel to send estate')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((opts) =>
					opts
						.setName(RealEstateSearchOption.URL)
						.setDescription('Set channel to send estate')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(RealEstateSearchType.DISABLED).setDescription('Disable search estate notification')
		)
		.toJSON(),

	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		new RealEstateSearchService(client, interaction).execute();
	}
};
