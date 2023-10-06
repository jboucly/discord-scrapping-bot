import { Missions } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from '../../common/services/prisma.service';

function createEmbeds(missions: Missions[]): EmbedBuilder[] {
	const valToReturn: EmbedBuilder[] = [];

	missions.forEach((mission) => {
		const embed = new EmbedBuilder()
			.setColor('#006F62')
			.setTitle(`Channel : ${mission.channelName}`)
			.setDescription(`Words : ${mission.words.join(', ')}`)
			.setTimestamp(mission.updatedAt);

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
		const prisma = new PrismaService();
		const alreadyExist = await prisma.missions.findMany();

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await interaction.reply('You have no mission notification configured');
			return;
		}

		await interaction.reply({ embeds: createEmbeds(alreadyExist) });
	},
};

export default MissionListCommand;
