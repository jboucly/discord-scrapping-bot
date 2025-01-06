import { ChannelType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { MissionOptions } from './enums/mission-option.enum';
import { MissionCommandService } from './services/mission-command.service';

export default {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Configure your mission notification. If you search freelancer job, you can use this ! 🔥')
		.addSubcommand((subcommand) =>
			subcommand
				.setName(MissionOptions.ENABLED)
				.setDescription('Enable mission notification')
				.addStringOption((opts) =>
					opts.setName(MissionOptions.WORDS).setDescription('Set keyword to search mission').setRequired(true)
				)
				.addChannelOption((opts) =>
					opts
						.setName(MissionOptions.CHANNEL)
						.setDescription('Set channel to send missions')
						.setRequired(true)
						.addChannelTypes(ChannelType.GuildText)
				)
				.addStringOption((opts) =>
					opts
						.setName(MissionOptions.FORBIDDEN_WORDS)
						.setDescription("It's possible to set forbidden words to exclude mission")
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(MissionOptions.DISABLED).setDescription('Disable mission notification')
		)
		.addSubcommand((subcommand) =>
			subcommand.setName(MissionOptions.LIST).setDescription('Get your mission notification configured')
		)
		.addSubcommand((subcommand) => subcommand.setName(MissionOptions.UPDATE).setDescription('Update your mission'))
		.toJSON(),

	async execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void> {
		new MissionCommandService(client, interaction).execute();
	}
};
