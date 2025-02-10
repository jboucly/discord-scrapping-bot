import { ITrackerProvider } from '@commands/ad-tracker/interfaces/tracker-provider.interface';
import { Ad } from '@commands/ad-tracker/types/ad.type';
import puppeteer, { sleep } from '@common/clients/puppeteer.client';
import { PuppeteerUtils } from '@common/utils/puppeteer.utils';
import { AdTrackers } from '@prisma/client';

export class ImmoNotaryProvider implements ITrackerProvider {
	public async getAds(adTracker: AdTrackers): Promise<Ad[]> {
		const browser = await puppeteer.launch(PuppeteerUtils.getBrowserConfig());
		const page = await browser.newPage();

		try {
			await page.setViewport({ width: 1080, height: 1024 });
			await page.goto(adTracker.url, { waitUntil: 'domcontentloaded' });
			await sleep(Math.random() * 2000 + 1000);

			await PuppeteerUtils.autoScroll(page);
			await sleep(Math.random() * 2000 + 1000);

			const cookieButton = await page.waitForSelector('button[class="tarteaucitronCTAButton tarteaucitronDeny"]');

			if (cookieButton) {
				await cookieButton.click();
				await cookieButton.dispose();
				await sleep(Math.random() * 2000 + 1000);
				await page.waitForSelector('div[class="colonne_liste_annonces"]');
			}

			const ads: Ad[] = await page.$$eval('inotr-bloc-annonce', (elements: Element[]) =>
				elements.map((element) => {
					const img = element.querySelector('div[class="container_photo"]')?.querySelector('a img');
					const title = element.querySelector('h2');
					const price = element.querySelector('div[class="valeur"]');
					const location = title?.querySelector('span[class="localisation"]')?.textContent?.trim();

					return {
						url: title?.querySelector('a')?.getAttribute('href'),
						img: img ? img.getAttribute('src') : undefined,
						title: `${title?.querySelector('span[class="type_bien"]')?.textContent}`,
						price: price ? (price.textContent?.trim() as string) : undefined,
						location: location ? location.split('à')[1]?.trimStart() : undefined,
						pricePerM2: undefined
					} as Ad;
				})
			);

			await browser.close();
			return ads;
		} catch (error) {
			await browser.close();

			console.error('[ADS TRACKER EVENT] - Error while getting ads for LBC');
			console.error(error);
			return [];
		}
	}
}
