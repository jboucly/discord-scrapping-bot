import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isNil } from 'lodash';
import JsonStorage from '../../common/services/json-storage.service';
import { MissionStorage } from './enums/mission-storage.enum';
import { MissionNotificationSaved } from './interfaces/mission-notification-saved.interface';

function createEmbeds(missions: MissionNotificationSaved[]): EmbedBuilder[] {
	const valToReturn: EmbedBuilder[] = [];

	missions.forEach((mission) => {
		const embed = new EmbedBuilder()
			.setTitle(`Channel: ${mission.channel}`)
			.setDescription(`Words: ${mission.words.join(', ')}`);

		valToReturn.push(embed);
	});

	return valToReturn;
}

const MissionListCommand = {
	data: new SlashCommandBuilder()
		.setName('mission-list')
		.setDescription('Get your mission notification configured')
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const storage = new JsonStorage('mission.json');
		const alreadyExist = storage.get(MissionStorage.NOTIFICATIONS, true) as MissionNotificationSaved[];

		if (isNil(alreadyExist)) {
			await interaction.reply('You have no mission notification configured');
			return;
		}

		await interaction.reply({ embeds: createEmbeds(alreadyExist) });
	},
};

export default MissionListCommand;
