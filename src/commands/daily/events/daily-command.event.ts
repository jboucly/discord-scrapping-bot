import { IEvent } from '@common/interfaces/event.interface';
import { Daily } from '@prisma/client';
import { CronJob } from 'cron';
import { Client, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { prismaClient } from '../../../common/services/prisma.service';

export class DailyCommandEvent implements IEvent {
	private readonly prismaService = prismaClient;

	public async startCronJobs(client: Client): Promise<void> {
		const cronData = await this.prismaService.daily.findMany();

		if (!isNil(cronData)) {
			cronData.forEach((daily: Daily) => {
				const cron = new CronJob(daily.crontab, () => {
					const channel = client.channels.cache.find(
						(channel: any) => channel.id === daily.channelId
					) as TextChannel;

					if (isNil(channel)) {
						console.error('Channel not found');
						return;
					}

					channel.send(daily.message);
				});

				cron.start();
			});

			console.info('\nℹ️  Daily Cron jobs started');
		}
	}
}
