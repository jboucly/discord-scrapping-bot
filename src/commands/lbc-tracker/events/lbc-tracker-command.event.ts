import { prismaClient } from '@common/clients/prisma.client';
import puppeteer, { sleep } from '@common/clients/puppeteer.client';
import { IEvent } from '@common/interfaces/event.interface';
import { PuppeteerUtils } from '@common/utils/puppeteer.utils';
import { LbcTracker, TreatyAdLbcTracker } from '@prisma/client';
import { CronJob } from 'cron';
import { format } from 'date-fns';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { isNil } from 'lodash';
import { Ad } from '../types/ad.type';

export class LBCTrackerCommandEvent implements IEvent {
	public async startCronJobs(client: Client): Promise<void> {
		const crontab = process.env.REAL_ESTATE_CRON;
		if (isNil(crontab)) throw new Error('Crontab for lbc tracker not found');

		const cron = new CronJob(crontab, async () => {
			await this.sendAdsNotifications(client);
		});

		cron.start();
		console.info('\nℹ️  LBC Tracker cron jobs started with crontab :', crontab, '\n');
	}

	private async sendAdsNotifications(client: Client): Promise<void> {
		let nbMessage = 0;
		const allLbcTracker = await prismaClient.lbcTracker.findMany({
			include: { TreatyAdLbcTracker: true }
		});

		for await (const lbcTracker of allLbcTracker) {
			const ads = await this.getLBCAds(lbcTracker);

			const channel = client.channels.cache.find(
				(channel: any) => channel.id === lbcTracker.channelId
			) as TextChannel;

			if (isNil(channel)) {
				console.error('[LBC TRACKER EVENT] - Channel not found');
				return;
			}

			for await (const ad of ads) {
				const treatyAd = await prismaClient.treatyAdLbcTracker.findFirst({
					where: { lbcTrackerId: lbcTracker.id, url: ad.url }
				});

				if (!treatyAd) {
					await this.saveTreatyAds(ad, lbcTracker.id);
					const embedMessage = this.createEmbeds(ad);

					await channel.send({
						embeds: [embedMessage],
						content: `Nouvelle annonces pour la recherche : ${lbcTracker.name} 🚀`
					});
					nbMessage++;
				}
			}
		}

		console.info(
			`ℹ️  ${nbMessage} lbc ads notification send \n⏰ ${format(
				new Date(),
				'dd/MM/yyyy HH:mm:ss'
			)}\n———————————————————————————————————————————————————————————`
		);
	}

	private async getLBCAds(lbcTracker: LbcTracker): Promise<Ad[]> {
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();

		try {
			await page.setViewport({ width: 1080, height: 1024 });
			await page.goto(lbcTracker.url, { waitUntil: 'domcontentloaded' });

			// Load all ads
			await PuppeteerUtils.autoScroll(page);
			await sleep(2382);

			const ads: Ad[] = await page.$$eval('a[data-test-id="ad"]', (elements: HTMLAnchorElement[]) =>
				elements.map((element) => {
					const img = element.querySelector('div[data-test-id="image"]')?.querySelector('picture img');
					const title = element.querySelector('h2');
					const price = element.querySelector("p[data-test-id='price']");
					const pricePerM2 = price?.parentElement?.children[1];
					const location = element.querySelector("p[aria-label*='Située à']");

					return {
						url: element.getAttribute('href'),
						title: title ? title.innerText.trim() : undefined,
						img: img ? (img.getAttribute('src') as string) : undefined,
						price: price ? (price.textContent?.trim() as string) : undefined,
						location: location ? (location.textContent?.trim() as string) : undefined,
						pricePerM2:
							pricePerM2 && pricePerM2.textContent !== title?.innerText
								? (pricePerM2.textContent?.trim() as string)
								: undefined
					} as Ad;
				})
			);

			await browser.close();
			return ads;
		} catch (error) {
			await page.screenshot({ path: `./screen/${new Date().toISOString()}-error-LBC.png`, fullPage: true });
			await browser.close();

			console.error('[LBC TRACKER EVENT] - Error while getting ads', error);
			return [];
		}
	}

	private async saveTreatyAds(ad: Ad, lbcTrackerId: number): Promise<TreatyAdLbcTracker> {
		return prismaClient.treatyAdLbcTracker.create({
			data: {
				url: ad.url,
				lbcTrackerId,
				price: ad.price,
				title: ad.title,
				imageUrl: ad.img,
				location: ad.location,
				pricePerM2: ad.pricePerM2
			}
		});
	}

	private createEmbeds(ad: Ad): EmbedBuilder {
		const price = ad.pricePerM2 ? `${ad.price} | ${ad.pricePerM2}` : `${ad.price}`;

		const embed = new EmbedBuilder()
			.setColor('#f56b2a')
			.setTitle(`➡️ ${ad.title}`)
			.setURL(`https://www.leboncoin.fr${ad.url}`)
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
}
