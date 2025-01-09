import { ICommand } from '@common/interfaces/command.interface';
import { PrismaClient, RealEstate } from '@prisma/client';
import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { isNil } from 'lodash';

export class RealEstateSearchListService implements ICommand {
	private readonly prismaClient = new PrismaClient();

	constructor(
		private readonly client: Client,
		private readonly interaction: ChatInputCommandInteraction
	) {}

	public async execute(): Promise<void> {
		const alreadyExist = await this.prismaClient.realEstate.findMany({
			where: { userId: this.interaction.user.id }
		});

		if (isNil(alreadyExist) || alreadyExist.length === 0) {
			await this.interaction.reply({
				flags: 'Ephemeral',
				content: '❌ You have no real estatet notification configured'
			});
			return;
		}

		await this.interaction.reply({
			flags: 'Ephemeral',
			withResponse: true,
			embeds: this.createEmbeds(alreadyExist)
		});
	}

	private createEmbeds(missions: RealEstate[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		missions.forEach((realEstate) => {
			const embed = new EmbedBuilder()
				.setColor('#006F62')
				.setTitle(
					`Channel : ${(this.client.channels.cache.find((channel) => channel.id === realEstate.channelId) as any)?.name}`
				)
				.setDescription(
					`
					Name : ${realEstate.name}
					URL : ${realEstate.url}
				`
				)
				.setTimestamp(realEstate.updatedAt);

			valToReturn.push(embed);
		});

		return valToReturn;
	}
}
