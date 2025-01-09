import { ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { LBCTrackerOption } from './enums/lbc-tracker-option.enum';
import { LBCTrackerType } from './enums/lbc-tracker-type.enum';
import { LBCTrackerService } from './services/lbc-tracker.service';

export default {
	data: new SlashCommandBuilder()
		.setName('search-estate')
		.setDescription('Configure your search estate search notification 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(LBCTrackerType.ENABLED)
				.setDescription('Enable search estate notification')
				.addStringOption((opts) =>
					opts.setName(LBCTrackerOption.NAME).setDescription('Set name to search').setRequired(true)
				)
				.addChannelOption((opts) =>
					opts
						.setName(LBCTrackerOption.CHANNEL)
						.setDescription('Set channel to send estate')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((opts) =>
					opts.setName(LBCTrackerOption.URL).setDescription('Set channel to send estate').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(LBCTrackerType.DISABLED).setDescription('Disable search estate notification')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(LBCTrackerType.LIST).setDescription('List all search estate notifications')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(LBCTrackerType.UPDATE).setDescription('Update your search estate')
		)
		.toJSON(),

	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		new LBCTrackerService(client, interaction).execute();
	}
};
