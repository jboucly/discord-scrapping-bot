/**
 * Script test to scrap immobilier.notaires.fr website
 */
import { config } from 'dotenv';
import { writeFile } from 'fs';
import { join } from 'path';
import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Ad } from './types/ad.type';
import { autoScroll, blockRequest, scroll, setConsole, sleep } from './utils';

config();

const restartScraping = async (browser: Browser) => {
	await browser.close();
	await scrape();
};

const loadAds = async (page: Page): Promise<Ad[]> => {
	return await page.$$eval('div[class="column is-half"]', (elements: Element[]) =>
		elements.map((element) => {
			const title = element
				.querySelector('article[class="media columns is-multiline"]')
				?.children[0]?.children[0]?.querySelector('a');
			const img = element.querySelector('div[class="carousel-container"]')?.children[1]
				?.children[0] as HTMLImageElement;
			const price = element
				.querySelector('footer[class="card-footer-items columns is-multiline"]')
				?.children[1]?.querySelector('span');
			const location = element
				.querySelector('footer[class="card-footer-items columns is-multiline"]')
				?.children[0]?.querySelector('span a span')?.textContent;
			const pricePerM2 = element
				.querySelector('footer[class="card-footer-items columns is-multiline"]')
				?.children[2]?.querySelector('span span[style="font-size: 0.8em;"]')?.textContent;

			return {
				title: `${title?.textContent}`,
				url: title?.getAttribute('href'),
				img: img ? img.getAttribute('src') : undefined,
				price: price ? (price.textContent?.trim() as string) : undefined,
				location: location ? location.split('à')[1]?.trimStart() : undefined,
				pricePerM2: pricePerM2 ? (pricePerM2.replace(')', '').replace('(', '') as string) : undefined
			} as Ad;
		})
	);
};

const getAds = async (page: Page): Promise<Ad[]> => {
	const adsList: Ad[] = [];
	let scrollBase = 0;
	const heightPage = await page.evaluate(() => document.body.scrollHeight);

	while (true) {
		const ads = await loadAds(page);

		for (const ad of ads) {
			if (ad.title && ad.url && ad.price) {
				adsList.push(ad);
			}
		}

		await scroll(page, { up: false, distance: 1000 });
		await sleep(1000);

		console.info(`ℹ️ --- Scrolling... ${scrollBase}/${heightPage}`);

		if (heightPage <= scrollBase) break;

		scrollBase += 1000;
	}

	return adsList.filter((value, index, self) => index === self.findIndex((t) => t.url === value.url));
};

/**
 * @description Start scrapping
 */
const scrape = async () => {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

	const browser = await puppeteer.launch({
		headless: false,
		// executablePath: puppeteer.executablePath(),
		args: [
			`--proxy-server=${process.env.PROXY}`
			// '--no-sandbox',
			// '--winhttp-proxy-resolver',
			// '--ignore-certificate-errors',
			// '--ignore-certificate-errors-spki-list'
		]
	});

	const page = await browser.newPage();
	setConsole(page);
	blockRequest(page);
	await page.setViewport({ width: 1920, height: 1080 });
	await page.setRequestInterception(true);

	console.info('ℹ️ --- Start scrapping moteurimmo.fr');

	try {
		await page.goto('https://moteurimmo.fr/', { waitUntil: 'domcontentloaded', timeout: 0 });

		console.info('ℹ️ --- Load localStorage for search');
		await page.evaluate(() => {
			localStorage.clear();
			localStorage.setItem(
				'query',
				'{"searchType":"classic","types":[1],"categories":[1],"sellerTypes":[1,2],"sortBy":"creationDate-desc","threshold":"","priceMin":90000,"priceMax":280000,"rentMin":"","rentMax":"","propertyChargesMin":"","propertyChargesMax":"","propertyTaxMin":"","propertyTaxMax":"","surfaceMin":"","surfaceMax":"","landSurfaceMin":"","landSurfaceMax":"","roomsMin":"","roomsMax":"","bedroomsMin":"","bedroomsMax":"","locations":[{"displayName":"Guipry-Messac (35480)","inseeCode":"35176","postalCode":"35480","coordinates":[-1.8275,47.8253]}],"excludedLocations":[],"includedAreas":[],"excludedAreas":[],"areasOnly":false,"radius":10,"constructionYearMin":"","constructionYearMax":"","floorMin":"","floorMax":"","buildingFloorsMin":"","buildingFloorsMax":"","pricePerSquareMeterMin":"","pricePerSquareMeterMax":"","profitabilityMin":"","profitabilityMax":"","priceGapMin":"","priceGapMax":"","priceDropMin":"","priceDropMax":"","populationMin":"","populationMax":"","energyGradeMin":"","energyGradeMax":"","gasGradeMin":"","gasGradeMax":"","options":[-2],"keywords":[],"keywordsOperator":1,"origins":[],"excludedOrigins":[],"excludedIds":[],"includedIds":[],"weights":{"categories":12,"locations":12,"options":{"-2":9},"sellerTypes":9,"types":12,"priceMin":9,"priceMax":9}}'
			);
		});

		await page.reload({ waitUntil: 'domcontentloaded' });
		await sleep(2000);
		console.info('ℹ️ --- Load localStorage done');

		const searchBtn = await page.waitForSelector('input[class^="button is-colored"]').catch(async () => {
			await restartScraping(browser);
		});

		if (searchBtn) {
			await searchBtn.click();
			console.info('ℹ️ --- Search button clicked');
			await sleep(3000);

			// Load all ads
			await autoScroll(page, { up: false });
			await sleep(2000);

			// Check limit modal appear
			let btnModalLimit = await page.$$('div[class="modal is-active"]');
			if (btnModalLimit.length > 0) {
				console.info('❌ --- Limit modal appear');
				await restartScraping(browser);
			}

			const nbAds = await page.$$eval('div[class="column is-half"]', (elements: Element[]) => elements.length);
			console.info(`ℹ️ --- Found ${nbAds} ads`);

			await autoScroll(page, { up: true });
			await sleep(3000);
			console.info('ℹ️ --- Load ads');

			await page.waitForSelector('div[class="column is-half"]').catch(async () => {
				await restartScraping(browser);
			});
			console.info('ℹ️ --- Search ads');

			const ads = await getAds(page);
			console.info('✅ --- Done scrapping');

			await browser.close();
			console.log(ads);

			const jsonData = JSON.stringify(ads, null, 2);

			writeFile(join(__dirname, 'output', 'ads.json'), jsonData, (err) => {
				if (err) {
					console.error("Erreur lors de l'écriture du fichier JSON :", err);
				} else {
					console.log('Fichier JSON créé avec succès !');
				}
			});
		} else {
			console.error('❌ --- Search button not found');
			await browser.close();
		}
	} catch (error) {
		console.error('❌ --- Error while scrapping', error);
		await browser.close();
		await restartScraping(browser);
	}
};

const main = async () => {
	if (!process.env.PROXY) throw new Error('❌ --- Proxy not found in .env file');

	console.info('ℹ️ --- Start scrapping moteurimmo.fr');
	await scrape();
};

main();
