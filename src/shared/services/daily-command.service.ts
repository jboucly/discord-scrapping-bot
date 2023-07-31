import { CronJob } from 'cron';
import { Client, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { Daily } from '../types/daily.types';
import JsonStorage from './json-storage.service';

export class DailyCommandService {
	public static startCronJobs(client: Client): void {
		const storage = new JsonStorage('daily.json');

		const cronData = storage.get('cron');

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
		}

		console.info('ℹ️  Cron jobs started\n');
	}
}
