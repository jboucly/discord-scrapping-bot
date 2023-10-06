import { CronJob } from 'cron';
import { format } from 'date-fns';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import fetch from 'node-fetch';
import { PrismaService } from '../../../common/services/prisma.service';
import { FreeWorkJobs } from '../interfaces/free-work-jobs.interface';
import { MissionNotification, MissionToTrack } from '../interfaces/mission-notification.interface';
import { PyloteJobs } from '../interfaces/pylote-jobs.interface';

export class MissionCommandService {
	constructor(private readonly prismaService: PrismaService = new PrismaService()) {}

	public async startCronJobs(client: Client): Promise<void> {
		const crontab = process.env.MISSION_CRON;
		if (isNil(crontab)) throw new Error('Crontab for mission not found');

		const cron = new CronJob(crontab, async () => {
			await this.sendMissionNotification(client);
		});

		cron.start();
		console.info('ℹ️  Mission Cron jobs started');
	}

	public async sendMissionNotification(client: Client): Promise<void> {
		let allMissions: MissionToTrack[] = [...(await this.getPyloteMission()), ...(await this.getFreeWorkMission())];

		const allMissionSearch = await this.prismaService.missions.findMany({ include: { treaty: true } });

		if (allMissionSearch.length > 0) {
			for (let i = 0; i < allMissionSearch.length; i++) {
				const missionSearch = allMissionSearch[i];

				for (let j = 0; j < allMissions.length; j++) {
					const missionToTrack = allMissions[j];

					const idToRemove = missionSearch.treaty.map((t) => t.missionTreatyId);
					const missionToSend = missionToTrack.missions.filter((m) => !idToRemove.includes(m.id));
					const embedMessages = this.createEmbeds(missionToSend);

					const channel = client.channels.cache.find(
						(channel: any) => channel.id === missionSearch.channelId,
					) as TextChannel;

					if (isNil(channel)) {
						console.error('Channel not found');
						return;
					}

					const nbMessage = embedMessages.length;

					if (embedMessages.length > 10) {
						let messageToSend = embedMessages;

						while (messageToSend.length > 0) {
							await channel.send({
								embeds: messageToSend.splice(0, 10),
								content: 'Nouvelle mission disponible ! 🚀',
							});
						}
					} else if (embedMessages.length > 0) {
						await channel.send({
							embeds: embedMessages,
							content: 'Nouvelle mission disponible ! 🚀',
						});
					}
					console.info(
						`ℹ️  ${nbMessage} missions notification send to ${channel.name}: ${channel.id}\n⏰ ${format(
							new Date(),
							'dd/MM/yyyy HH:mm:ss',
						)}\n———————————————————————————————————————————————————————————`,
					);

					if (missionToSend.length > 0) {
						await this.prismaService.treatyMission.createMany({
							data: missionToSend.map((m) => ({
								createdAt: new Date(),
								updatedAt: new Date(),
								url: m?.url,
								name: m?.name,
								missionTreatyId: m.id,
								missionId: missionSearch.id,
							})),
						});
					}
				}
			}
		}
	}

	private createEmbeds(missions: MissionNotification[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		for (let i = 0; i < missions.length; i++) {
			const mission = missions[i];

			const embed = new EmbedBuilder()
				.setColor(mission.from === 'pylote' ? '#8FFFD0' : '#F76C01')
				.setTitle(`➡️ ${mission.name}`)
				.setURL(mission.url)
				.setDescription('ℹ️ Informations :')
				.setFields([
					{ name: 'Durée', value: `${mission.durationMonth} mois`, inline: true },
					{ name: 'Ville', value: `${mission.city}`, inline: true },
					{ name: 'Plateforme', value: `${mission.platform}`, inline: true },
					{ name: 'Date', value: `${format(new Date(mission.date), 'dd/MM/yyyy')}`, inline: true },
				])
				.setTimestamp();

			if (mission.from === 'freework') {
				embed.setImage(mission.iconUrl as string);

				if (!isNil(mission.description)) {
					embed.setDescription(
						mission.description.length > 100 ? mission.description.slice(0, 100) : mission.description,
					);
				}

				if (!isNil(mission.skills) && mission.skills?.length > 0) {
					embed.addFields({ name: 'Compétences', value: mission.skills?.join(', ') as string });
				}
			}

			valToReturn.push(embed);
		}

		return valToReturn;
	}

	private async getFreeWorkMission(): Promise<MissionToTrack[]> {
		const valToReturn: MissionToTrack[] = [];
		const allMissionSearch = await this.prismaService.missions.findMany();

		if (!isNil(process.env.FREE_WORK_URL) && !isNil(allMissionSearch)) {
			for (let i = 0; i < allMissionSearch.length; i++) {
				const missionSearch = allMissionSearch[i];
				const toReturn: MissionToTrack = { channelId: missionSearch.channelId, missions: [] };
				const response = await fetch(
					`${process.env.FREE_WORK_URL}?contracts=contractor&searchKeywords=${missionSearch.words.join(
						',',
					)}&order=date&page=1&itemsPerPage=20`,
				);
				const jobs = (await response.json()) as FreeWorkJobs;

				for (let j = 0; j < jobs['hydra:member'].length; j++) {
					const job = jobs['hydra:member'][j];

					toReturn.missions.push({
						id: `${job.id}`,
						from: 'freework',
						name: job.title,
						date: job.createdAt,
						city: job.location.label,
						platform: 'FreeWork',
						description: job?.description,
						iconUrl: job?.company?.logo?.medium,
						skills: job?.skills.map((v) => v.name),
						durationMonth: job?.durationValue
							? `${job?.durationValue} ${job?.durationPeriod}`
							: 'Non mentionné',
						url: `https://www.free-work.com/fr/tech-it/developpeur-java/job-mission/${job.slug}`,
					});
				}

				valToReturn.push(toReturn);
			}
		}

		return valToReturn;
	}

	private async getPyloteMission(): Promise<MissionToTrack[]> {
		const valToReturn: MissionToTrack[] = [];
		const allMissionSearch = await this.prismaService.missions.findMany();

		if (!isNil(process.env.PYLOTE_URL) && !isNil(allMissionSearch)) {
			const response = await fetch(process.env.PYLOTE_URL);
			const jobs = (await response.json()) as PyloteJobs[];

			for (let i = 0; i < allMissionSearch.length; i++) {
				const missionSearch = allMissionSearch[i];
				const toReturn: MissionToTrack = { channelId: missionSearch.channelId, missions: [] };

				for (let i = 0; i < jobs.length; i++) {
					const job = jobs[i];

					if (
						missionSearch.words.find((w) => job.Title.toLocaleLowerCase().includes(w.toLocaleLowerCase()))
					) {
						toReturn.missions.push({
							id: job.id,
							from: 'pylote',
							name: job.Title,
							url: job.URL,
							date: job.Date,
							city: job.Ville,
							platform: job.Plateforme,
							durationMonth: job.Durée_mois,
						});
					}
				}

				valToReturn.push(toReturn);
			}
		}

		return valToReturn;
	}
}
