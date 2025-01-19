/**
 * @fileoverview This script is used to scrap the seloger website to get the latest ads
 *
 * This script not working try to fix it
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
		'https://www.seloger.com/list.htm?projects=2&types=2&natures=1&places=%5B%7B%22inseeCodes%22:%5B350176%5D%7D,%7B%22inseeCodes%22:%5B350129%5D%7D,%7B%22inseeCodes%22:%5B350221%5D%7D%5D&price=NaN/280000&mandatorycommodities=0&enterprise=0&qsVersion=1.0&m=search_refine-redirection-search_results',
		{ waitUntil: 'load' }
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

	const ads: Ad[] = await page.$$eval('div[data-testid="sl.explore.card-container"]', (elements) =>
		elements.map((element) => {
			const img = element.querySelector('div[data-testid="gsl.uilib.Slider.Item[0]"]')?.querySelector('img');
			const title = element.querySelector('div[data-test="sl.title"]');
			const price = element.querySelector('div[data-test="sl.price-label"]');
			const pricePerM2 = price?.parentElement?.children[1];
			const location = element.querySelector('div[data-test="sl.address"]');

			console.log(element.innerHTML);

			return {
				url: element.querySelector('a')?.getAttribute('href'),
				img: img ? img.getAttribute('src') : undefined,
				title: title ? (title.textContent?.trim() as string) : undefined,
				price: price ? (price.textContent?.trim() as string) : undefined,
				location: location ? (location.textContent?.trim() as string) : undefined,
				pricePerM2: pricePerM2 ? (pricePerM2.textContent?.trim() as string) : undefined
			} as Ad;
		})
	);

	await browser.close();
	console.log(ads);
});
