import { IEvent } from '@common/interfaces/event.interface';
import { prismaClient } from '@common/services/prisma.service';
import { CronJob } from 'cron';
import { Client } from 'discord.js';
import { isNil } from 'lodash';
import { RealEstateAd } from '../types/ad.type';

export class LBCTrackerCommandEvent implements IEvent {
	private readonly prismaService = prismaClient;

	public async startCronJobs(client: Client): Promise<void> {
		const crontab = process.env.REAL_ESTATE_CRON;
		if (isNil(crontab)) throw new Error('Crontab for real estate not found');

		const cron = new CronJob(crontab, async () => {
			await this.sendAdsNotifications(client);
		});

		cron.start();
		console.info('\nℹ️  Real Estate cron jobs started with crontab :', crontab);
	}

	private async sendAdsNotifications(_client: Client): Promise<void> {
		const allRealEstate: RealEstateAd[] = [];

		const allMissionSearch = await this.prismaService.lbcTracker.findMany({ include: { TreatyRealEstate: true } });
	}
}
