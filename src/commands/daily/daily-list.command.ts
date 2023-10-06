import { Daily } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from '../../common/services/prisma.service';

const TransformCrontab = require('cronstrue');

function createEmbeds(daily: Daily[]): EmbedBuilder[] {
	const valToReturn: EmbedBuilder[] = [];

	daily.forEach((d) => {
		const embed = new EmbedBuilder()
			.setColor('#006F62')
			.setTitle(`Channel : ${d.channelName}`)
			.setDescription(`${TransformCrontab.toString(d.crontab, { verbose: true })}.\nWith message: ${d.message}`)
			.setTimestamp(d.updatedAt);

		valToReturn.push(embed);
	});

	return valToReturn;
}

const DailyListCommand = {
	data: new SlashCommandBuilder().setName('daily-list').setDescription('Get your daily configured').toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const prisma = new PrismaService();
		const alreadyExist = await prisma.daily.findMany();

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await interaction.reply('You have no daily configured');
			return;
		}

		await interaction.reply({ embeds: createEmbeds(alreadyExist) });
	},
};

export default DailyListCommand;
