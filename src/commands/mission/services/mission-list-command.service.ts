import { Missions } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { isNil } from 'lodash';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { SetDevBotReact } from '../../../common/utils/react.utils';

export class MissionListCommandService implements ICommand {
	constructor(
		private client: Client,
		private prismaService: PrismaService,
		private interaction: ChatInputCommandInteraction,
	) {}

	public async execute(): Promise<void> {
		const alreadyExist = await this.prismaService.missions.findMany({
			where: { userId: this.interaction.user.id },
		});

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await this.interaction.reply({
				content: 'You have no mission notification configured',
				ephemeral: true,
			});
			return;
		}

		const message = await this.interaction.reply({ embeds: this.createEmbeds(alreadyExist), fetchReply: true });
		await SetDevBotReact(this.client, message);
	}

	private createEmbeds(missions: Missions[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		console.log(missions);

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
