import { ITrackerProvider } from '@commands/ad-tracker/interfaces/tracker-provider.interface';
import { Ad } from '@commands/ad-tracker/types/ad.type';
import puppeteer, { sleep } from '@common/clients/puppeteer.client';
import { PuppeteerUtils } from '@common/utils/puppeteer.utils';
import { AdTrackers } from '@prisma/client';

export class LbcTrackerProvider implements ITrackerProvider {
	public async getAds(adTracker: AdTrackers): Promise<Ad[]> {
		const browser = await puppeteer.launch(PuppeteerUtils.getBrowserConfig());
		const page = await browser.newPage();
		// Debug ⤵️
		// PuppeteerUtils.setConsoleEvents(page);

		try {
			await page.setViewport({ width: 1080, height: 1024 });
			await page.goto(adTracker.url, { waitUntil: 'domcontentloaded' });
			await sleep(Math.random() * 2000 + 1000);

			// Load all ads
			await PuppeteerUtils.autoScroll(page);
			await sleep(Math.random() * 2000 + 1000);

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

			console.error('[ADS TRACKER EVENT] - Error while getting ads', error);
			return [];
		}
	}
}
