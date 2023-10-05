import { CronJob } from 'cron';
import { format } from 'date-fns';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import fetch from 'node-fetch';
import JsonStorage from '../../../common/services/json-storage.service';
import { MissionStorage } from '../enums/mission-storage.enum';
import { MissionNotificationSaved } from '../interfaces/mission-notification-saved.interface';
import { MissionNotification } from '../interfaces/mission-notification.interface';
import { PyloteJobs } from '../interfaces/pylote-jobs.interface';

export class MissionCommandService {
	private storage = new JsonStorage('mission.json');

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
		let allMissions: MissionNotification[] = [...(await this.getPyloteMission())];
		const missionAlreadySend = this.storage.get(MissionStorage.MISSION_ID_SENDED) as string[];

		if (!isNil(missionAlreadySend)) {
			allMissions = allMissions.filter((m) => !missionAlreadySend.includes(m.id));
		}

		const embedMessages = this.createEmbeds(allMissions);
		const allMissionSearch = this.storage.get(MissionStorage.NOTIFICATIONS) as MissionNotificationSaved[];

		if (!isNil(allMissionSearch)) {
			for (let i = 0; i < allMissionSearch.length; i++) {
				const missionSearch = allMissionSearch[i];

				const channel = client.channels.cache.find(
					(channel: any) => channel.id === missionSearch.channel
				) as TextChannel;

				if (isNil(channel)) {
					console.error('Channel not found');
					return;
				}

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
					`ℹ️  ${embedMessages.length} missions notification send to ${channel.name}: ${
						channel.id
					}\n⏰ ${format(
						new Date(),
						'dd/MM/yyyy HH:mm'
					)}\n———————————————————————————————————————————————————————————`
				);

				if (allMissions.length > 0) {
					this.storage.update(
						MissionStorage.MISSION_ID_SENDED,
						allMissions.map((m) => m.id),
						true
					);
				}
			}
		}
	}

	private async getPyloteMission(): Promise<MissionNotification[]> {
		const valToReturn: MissionNotification[] = [];

		const allMissionSearch = this.storage.get(MissionStorage.NOTIFICATIONS) as MissionNotificationSaved[];

		if (!isNil(process.env.PYLOTE_URL) && !isNil(allMissionSearch)) {
			const response = await fetch(process.env.PYLOTE_URL);
			const jobs = (await response.json()) as PyloteJobs[];

			for (let i = 0; i < jobs.length; i++) {
				const job = jobs[i];

				for (let i = 0; i < allMissionSearch.length; i++) {
					const missionSearch = allMissionSearch[i];

					if (
						missionSearch.words.find((w) => job.Title.toLocaleLowerCase().includes(w.toLocaleLowerCase()))
					) {
						valToReturn.push({
							id: job.id,
							name: job.Title,
							url: job.URL,
							date: job.Date,
							city: job.Ville,
							platform: job.Plateforme,
							durationMonth: job.Durée_mois,
						});
					}
				}
			}
		}

		return valToReturn;
	}

	private createEmbeds(missions: MissionNotification[]): EmbedBuilder[] {
		const valToReturn: EmbedBuilder[] = [];

		for (let i = 0; i < missions.length; i++) {
			const mission = missions[i];

			valToReturn.push(
				new EmbedBuilder()
					.setColor('#FF0000')
					.setTitle(`➡️ ${mission.name}`)
					.setURL(mission.url)
					.setDescription('ℹ️ Informations :')
					.setFields([
						{ name: 'Durée', value: `${mission.durationMonth} mois`, inline: true },
						{ name: 'Ville', value: `${mission.city}`, inline: true },
						{ name: 'Plateforme', value: `${mission.platform}`, inline: true },
						{ name: 'Date', value: `${format(new Date(mission.date), 'dd/MM/yyyy')}`, inline: true },
					])
					.setTimestamp()
			);
		}

		return valToReturn;
	}
}
