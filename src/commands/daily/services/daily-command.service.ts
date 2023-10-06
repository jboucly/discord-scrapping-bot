import { Daily } from '@prisma/client';
import { CronJob } from 'cron';
import { Client, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { PrismaService } from '../../../common/services/prisma.service';

export class DailyCommandService {
	constructor(private readonly prismaService: PrismaService = new PrismaService()) {}

	public async startCronJobs(client: Client): Promise<void> {
		const cronData = await this.prismaService.daily.findMany();

		if (!isNil(cronData)) {
			cronData.forEach((daily: Daily) => {
				const cron = new CronJob(daily.crontab, () => {
					const channel = client.channels.cache.find(
						(channel: any) => channel.id === daily.channelId,
					) as TextChannel;

					if (isNil(channel)) {
						console.error('Channel not found');
						return;
					}

					channel.send(daily.message);
				});

				cron.start();
			});

			console.info('ℹ️  Daily Cron jobs started');
		}
	}
}
