/**
 * Script test to scrap immobilier.notaires.fr website
 */

import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { autoScroll } from './utils/autoscroll.utils';
import { setConsole } from './utils/console.utils';
import { sleep } from './utils/sleep.utils';

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer.launch({ headless: false }).then(async (browser) => {
	const page = await browser.newPage();
	setConsole(page);

	console.info('ℹ️ --- Start scrapping moteurimmo.fr');

	await page.setViewport({ width: 1920, height: 1080 });
	await page.goto('https://moteurimmo.fr/', { waitUntil: 'domcontentloaded' });

	console.log('COOKIE1', await browser.cookies());
	await browser.deleteCookie(...(await browser.cookies()));

	// await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });

	console.info('ℹ️ --- Load localStorage');

	await page.evaluate(() => {
		localStorage.clear();
		localStorage.setItem(
			'query',
			'{"searchType":"classic","types":[1],"categories":[1],"sellerTypes":[1,2],"sortBy":"creationDate-desc","threshold":"","priceMin":90000,"priceMax":280000,"rentMin":"","rentMax":"","propertyChargesMin":"","propertyChargesMax":"","propertyTaxMin":"","propertyTaxMax":"","surfaceMin":"","surfaceMax":"","landSurfaceMin":"","landSurfaceMax":"","roomsMin":"","roomsMax":"","bedroomsMin":"","bedroomsMax":"","locations":[{"displayName":"Guipry-Messac (35480)","inseeCode":"35176","postalCode":"35480","coordinates":[-1.8275,47.8253]}],"excludedLocations":[],"includedAreas":[],"excludedAreas":[],"areasOnly":false,"radius":10,"constructionYearMin":"","constructionYearMax":"","floorMin":"","floorMax":"","buildingFloorsMin":"","buildingFloorsMax":"","pricePerSquareMeterMin":"","pricePerSquareMeterMax":"","profitabilityMin":"","profitabilityMax":"","priceGapMin":"","priceGapMax":"","priceDropMin":"","priceDropMax":"","populationMin":"","populationMax":"","energyGradeMin":"","energyGradeMax":"","gasGradeMin":"","gasGradeMax":"","options":[-2],"keywords":[],"keywordsOperator":1,"origins":[],"excludedOrigins":[],"excludedIds":[],"includedIds":[],"weights":{"categories":12,"locations":12,"options":{"-2":9},"sellerTypes":9,"types":12,"priceMin":9,"priceMax":9}}'
		);
	});
	await page.reload({ waitUntil: 'domcontentloaded' });

	console.info('ℹ️ --- Load localStorage done');
	console.log('COOKIE', await browser.cookies());

	// await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });
	await sleep(2382);

	const searchBtn = await page.waitForSelector('input[class^="button is-colored"]');

	if (searchBtn) {
		await searchBtn.click();
		await autoScroll(page);

		// await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });

		// await page.waitForSelector('div[class="box property"]');

		// const ads: Ad[] = await page.$$eval('inotr-bloc-annonce', (elements: Element[]) =>
		// 	elements.map((element) => {
		// 		const img = element.querySelector('div[class="container_photo"]')?.querySelector('a img');
		// 		const title = element.querySelector('h2');
		// 		const price = element.querySelector('div[class="valeur"]');
		// 		const location = title?.querySelector('span[class="localisation"]')?.textContent?.trim();

		// 		console.log(title);

		// 		return {
		// 			url: title?.querySelector('a')?.getAttribute('href'),
		// 			img: img ? img.getAttribute('src') : undefined,
		// 			title: `${title?.querySelector('span[class="type_bien"]')?.textContent}`,
		// 			price: price ? (price.textContent?.trim() as string) : undefined,
		// 			location: location ? location.split('à')[1]?.trimStart() : undefined,
		// 			pricePerM2: undefined
		// 		} as Ad;
		// 	})
		// );

		await browser.close();
		// console.log(ads);
	} else {
		console.error('❌ --- Search button not found');
		await browser.close();
	}
});
