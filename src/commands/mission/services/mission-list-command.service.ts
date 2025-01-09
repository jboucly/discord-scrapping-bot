import { prismaClient } from '@common/clients/prisma.client';
import { ICommand } from '@common/interfaces/command.interface';
import { Missions } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { isNil } from 'lodash';

export class MissionListCommandService implements ICommand {
	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const alreadyExist = await prismaClient.missions.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await this.interaction.reply({
				content: 'You have no mission notification configured',
				ephemeral: true
			});
			return;
		}

		await this.interaction.reply({ embeds: this.createEmbeds(alreadyExist), withResponse: true, ephemeral: true });
	}

	private createEmbeds(missions: Missions[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		missions.forEach((mission) => {
			let desc = `Words : ${mission.words.join(', ')}`;

			if (mission.forbiddenWords.length > 0) {
				desc += `\n Forbidden words : ${mission.forbiddenWords.join(', ')}`;
			}

			const embed = new EmbedBuilder()
				.setColor('#006F62')
				.setTitle(`Channel : ${mission.channelName}`)
				.setDescription(desc)
				.setTimestamp(mission.updatedAt);

			valToReturn.push(embed);
		});

		return valToReturn;
	}
}
