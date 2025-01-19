import { prismaClient } from '@common/clients/prisma.client';
import { IEvent } from '@common/interfaces/event.interface';
import { AdTrackers, AdTrackerType, TreatyAdTracker } from '@prisma/client';
import { CronJob } from 'cron';
import { format } from 'date-fns';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { Ad } from '../types/ad.type';
import { LbcTrackerProvider } from './providers/lbc-tracker.provider';
import { OuestfranceImmoTrackerProvider } from './providers/ouestfrance-immo-tracker.provider';

export class AdTrackerCommandEvent implements IEvent {
	private lbcTrackerProvider = new LbcTrackerProvider();
	private ouestfranceImmoTrackerProvider = new OuestfranceImmoTrackerProvider();

	public async startCronJobs(client: Client): Promise<void> {
		const crontab = process.env.AD_TRACKER_CRON;
		if (isNil(crontab)) throw new Error('Crontab for ad tracker not found');

		const cron = new CronJob(crontab, async () => {
			await this.sendAdsNotifications(client);
		});

		cron.start();
		console.info('\nℹ️  Ad Tracker cron jobs started with crontab :', crontab, '\n');
	}

	private async sendAdsNotifications(client: Client): Promise<void> {
		let nbMessage = 0;
		const allAdTracker = await prismaClient.adTrackers.findMany({
			include: { TreatyAdTracker: true }
		});

		for await (const adTracker of allAdTracker) {
			const ads = await this.getAds(adTracker);

			const channel = client.channels.cache.find(
				(channel: any) => channel.id === adTracker.channelId
			) as TextChannel;

			if (isNil(channel)) {
				console.error('[ADS TRACKER EVENT] - Channel not found');
				return;
			}

			for await (const ad of ads) {
				const treatyAd = await prismaClient.treatyAdTracker.findFirst({
					where: { adTrackerId: adTracker.id, url: ad.url }
				});

				if (!treatyAd) {
					await this.saveTreatyAds(ad, adTracker.id);
					const embedMessage = this.createEmbeds(ad, adTracker.type);

					await channel.send({
						embeds: [embedMessage],
						content: `New ads for research : ${adTracker.name} 🚀`
					});
					nbMessage++;
				}
			}
		}

		console.info(
			`ℹ️  ${nbMessage} ads notification send \n⏰ ${format(
				new Date(),
				'dd/MM/yyyy HH:mm:ss'
			)}\n———————————————————————————————————————————————————————————`
		);
	}

	/**
	 * @description Get ads from ad tracker
	 */
	private async getAds(adTracker: AdTrackers): Promise<Ad[]> {
		switch (adTracker.type) {
			case 'LBC':
				return await this.lbcTrackerProvider.getAds(adTracker);
			case 'OUEST_FRANCE_IMMO':
				return await this.ouestfranceImmoTrackerProvider.getAds(adTracker);

			default:
				throw new Error('[ADS TRACKER EVENT] - Type not found');
		}
	}

	/**
	 * @description Save ads treaty in database
	 */
	private async saveTreatyAds(ad: Ad, adTrackerId: number): Promise<TreatyAdTracker> {
		return prismaClient.treatyAdTracker.create({
			data: {
				url: ad.url,
				adTrackerId,
				price: ad.price,
				title: ad.title,
				imageUrl: ad.img,
				location: ad.location,
				pricePerM2: ad.pricePerM2
			}
		});
	}

	/**
	 * @description Create embeds for discord message
	 */
	private createEmbeds(ad: Ad, type: AdTrackerType): EmbedBuilder {
		const price = ad.pricePerM2 ? `${ad.price} | ${ad.pricePerM2}` : `${ad.price}`;

		const embed = new EmbedBuilder()
			.setColor('#f56b2a')
			.setTitle(`➡️ ${ad.title}`)
			.setURL(this.getUrl(ad.url, type))
			.setFields([
				{ name: 'Prix', value: price, inline: true },
				{ name: 'Ville', value: `${ad.location}`, inline: true }
			])
			.setTimestamp();

		if (!isNil(ad.img)) {
			embed.setImage(ad.img);
		}

		return embed;
	}

	/**
	 * @description Get the url for the ad tracker
	 */
	private getUrl(url: string | null, adTrackerType: AdTrackerType): string {
		switch (adTrackerType) {
			case 'LBC':
				return `https://www.leboncoin.fr${url}`;
			case 'OUEST_FRANCE_IMMO':
				return `https://www.ouestfrance-immo.com/${url}`;
			default:
				throw new Error('[ADS TRACKER EVENT] - Type not found for set url');
		}
	}
}
