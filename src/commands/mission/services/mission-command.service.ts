import { CronJob } from 'cron';
import { Client, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import JsonStorage from '../../../common/services/json-storage.service';
import { Daily } from '../../daily/types/daily.types';
import { MissionOptions } from '../enums/mission-option.enum';

export class MissionCommandService {
	public static startCronJobs(client: Client): void {
		const storage = new JsonStorage('mission.json');
		const cronData = storage.get(MissionOptions.WORDS);

		if (!isNil(cronData)) {
			cronData.forEach((daily: Daily) => {
				const cron = new CronJob(daily.time, () => {
					const channel = client.channels.cache.find(
						(channel: any) => channel.id === daily.channel
					) as TextChannel;

					if (isNil(channel)) {
						console.error('Channel not found');
						return;
					}

					channel.send(daily.message);
				});

				cron.start();
			});

			console.info('ℹ️  Mission cron jobs started\n');
		}
	}
}
