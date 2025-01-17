import { ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { AdTrackerOption } from './enums/ad-tracker-option.enum';
import { AdTrackerType } from './enums/ad-tracker-type.enum';
import { AdTrackerService } from './services/ad-tracker.service';

export default {
	data: new SlashCommandBuilder()
		.setName('ad-tracker')
		.setDescription('Configure your search ad notification 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(AdTrackerType.ENABLED)
				.setDescription('Enable search ad notification')
				.addStringOption((opts) =>
					opts.setName(AdTrackerOption.NAME).setDescription('Set name to search').setRequired(true)
				)
				.addChannelOption((opts) =>
					opts
						.setName(AdTrackerOption.CHANNEL)
						.setDescription('Set channel to send estate')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((opts) =>
					opts.setName(AdTrackerOption.URL).setDescription('Set channel to send all ads').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerType.DISABLED).setDescription('Disable search ad notification')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerType.LIST).setDescription('List all search ads notifications')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerType.UPDATE).setDescription('Update your search ads')
		)
		.toJSON(),

	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		new AdTrackerService(client, interaction).execute();
	}
};
