/**
 * Script test to scrap leboncoin website
 */
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { autoScroll } from './utils/autoscroll.utils';
import { sleep } from './utils/sleep.utils';

type Ad = {
	url: string | null;
	title?: string;
	img?: string;
	price?: string;
	pricePerM2?: string;
	location?: string;
};

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer.launch({ headless: true }).then(async (browser) => {
	const page = await browser.newPage();
	await page.setViewport({ width: 1080, height: 1024 });

	await page.goto(
		'https://www.leboncoin.fr/recherche?category=9&text=maison&locations=Guipry-Messac_35480__47.82405_-1.80585_5000_10000&real_estate_type=1&price=min-290000&kst=r',
		{ waitUntil: 'domcontentloaded' }
	);

	await autoScroll(page);
	await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });
	await sleep(2382);

	page.on('console', async (msg) => {
		const msgArgs = msg.args();

		for (const element of msgArgs) {
			console.log(await element?.jsonValue());
		}
	});

	const ads: Ad[] = await page.$$eval('a[data-test-id="ad"]', (elements: HTMLAnchorElement[]) =>
		elements.map((element) => {
			const img = element.querySelector('div[data-test-id="image"]')?.querySelector('picture img');
			const title = element.querySelector('h2');
			const price = element.querySelector("p[data-test-id='price']");
			const pricePerM2 = price?.parentElement?.children[1];
			const location = element.querySelector("p[aria-label*='Située à']");

			return {
				url: element.getAttribute('href'),
				img: img ? img.getAttribute('src') : undefined,
				title: title ? title.innerText.trim() : undefined,
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
	console.log(ads);
});
