import { ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { AdTrackerCommandType } from './enums/ad-tracker-command-type.enum';
import { AdTrackerOption } from './enums/ad-tracker-option.enum';
import { AdTrackerService } from './services/ad-tracker.service';
import { GetAdTrackerTypeChoice } from './utils/ad-tracker-type.utils';

export default {
	data: new SlashCommandBuilder()
		.setName('ad-tracker')
		.setDescription('Configure your search ad notification 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(AdTrackerCommandType.ENABLED)
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
					opts
						.setName(AdTrackerOption.TYPE)
						.setDescription('Set website for your search')
						.setRequired(true)
						.setChoices(GetAdTrackerTypeChoice())
				)
				.addStringOption((opts) =>
					opts.setName(AdTrackerOption.URL).setDescription('Set channel to send all ads').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerCommandType.DISABLED).setDescription('Disable search ad notification')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerCommandType.LIST).setDescription('List all search ads notifications')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(AdTrackerCommandType.UPDATE).setDescription('Update your search ads')
		)
		.toJSON(),

	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		new AdTrackerService(client, interaction).execute();
	}
};
