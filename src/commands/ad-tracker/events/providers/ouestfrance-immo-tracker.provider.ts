import { ITrackerProvider } from '@commands/ad-tracker/interfaces/tracker-provider.interface';
import { Ad } from '@commands/ad-tracker/types/ad.type';
import { sleep } from '@common/clients/puppeteer.client';
import { PuppeteerUtils } from '@common/utils/puppeteer.utils';
import { AdTrackers } from '@prisma/client';
import puppeteer from 'puppeteer';

export class OuestfranceImmoTrackerProvider implements ITrackerProvider {
	public async getAds(adTracker: AdTrackers): Promise<Ad[]> {
		const browser = await puppeteer.launch(PuppeteerUtils.getBrowserConfig());
		const page = await browser.newPage();

		// Debug ⤵️
		// PuppeteerUtils.setConsoleEvents(page);

		try {
			await page.setViewport({ width: 1080, height: 1024 });
			await page.goto(adTracker.url, { waitUntil: ['domcontentloaded', 'networkidle0', 'networkidle2', 'load'] });
			await sleep(Math.random() * 2000 + 1000);

			// Load all ads
			await PuppeteerUtils.autoScroll(page);
			await sleep(Math.random() * 2000 + 1000);

			const ads: Ad[] = await page.$$eval(
				'article[data-t="carte-annonce"], article[data-t="premium"]',
				(elements) =>
					elements.map((element) => {
						const img = element.querySelector('header')?.querySelector('img');
						const title = element
							.querySelector('h3[class="card-annonce__content__title"]')
							?.children.item(0);
						const location = element
							.querySelector('h3[class="card-annonce__content__title"]')
							?.children.item(1);
						const price = element.querySelector(
							'span[class="detail-prix card-annonce__content__price__main"]'
						);
						const pricePerM2 = element.querySelector('sup[class="detail-prix__prix-m2"]');

						const priceTransformed = price ? (price.textContent?.trim() as string) : null;

						return {
							url: element.querySelector('a')?.getAttribute('href'),
							img: img ? img.getAttribute('src') : undefined,
							title: title ? (title.textContent?.trim() as string) : undefined,
							price: priceTransformed
								? priceTransformed.slice(0, priceTransformed.trim().indexOf('€') + 1)
								: undefined,
							location: location ? (location.textContent?.trim() as string) : undefined,
							pricePerM2: pricePerM2
								? (pricePerM2.textContent?.trim() as string).replace('(', '').replace(')', '')
								: undefined
						} as Ad;
					})
			);

			await browser.close();
			return ads;
		} catch (error) {
			await browser.close();

			console.error('[ADS TRACKER EVENT] - Error while getting ads for Ouestfrance immo');
			console.error(error);
			return [];
		}
	}
}
