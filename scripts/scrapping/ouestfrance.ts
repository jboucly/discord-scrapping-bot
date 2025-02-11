/**
 * Script test to scrap ouest-france website
 */
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Ad } from './types/ad.type';
import { autoScroll } from './utils/autoscroll.utils';
import { sleep } from './utils/sleep.utils';

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer.launch({ headless: true }).then(async (browser) => {
	const page = await browser.newPage();
	await page.setViewport({ width: 1080, height: 1024 });

	await page.goto(
		'https://www.ouestfrance-immo.com/acheter/guipry-messac-35-35480/?prix=0_280000&types=maison,demeure-exception,longere-et-corps-de-ferme',
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

	const ads: Ad[] = await page.$$eval('article[data-t="carte-annonce"], article[data-t="premium"]', (elements) =>
		elements.map((element) => {
			const img = element.querySelector('header')?.querySelector('img');
			const title = element.querySelector('h3[class="card-annonce__content__title"]')?.children.item(0);
			const location = element.querySelector('h3[class="card-annonce__content__title"]')?.children.item(1);
			const price = element.querySelector('span[class="detail-prix card-annonce__content__price__main"]');
			const pricePerM2 = element.querySelector('sup[class="detail-prix__prix-m2"]');

			const priceTransformed = price ? (price.textContent?.trim() as string) : null;

			return {
				url: `https://www.ouestfrance-immo.com/${element.querySelector('a')?.getAttribute('href')}`,
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
	console.log(ads);
});
