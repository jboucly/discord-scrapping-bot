/**
 * Script test to scrap immobilier.notaires.fr website
 */
import fetch from 'node-fetch';
import { Browser } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { Ad } from './types/ad.type';
import { ProxyScrapeAPi, ProxyScrapeApiResponse } from './types/proxyScrape.type';
import { autoScroll, scroll, setConsole, sleep } from './utils';

let nbProxy = 0;
let nbTry = 0;
let proxiesWorking: ProxyScrapeAPi[] = [];

/**
 * @description Get free proxies from proxyscrape.com and sort them by latency
 * @returns {Promise<ProxyScrapeAPi[]>} List of proxies
 */
const getAndSortProxies = async (): Promise<ProxyScrapeAPi[]> => {
	const allProxies = await fetch(
		'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json'
	);
	const res: ProxyScrapeApiResponse = await allProxies.json();

	return res.proxies
		.filter(
			(proxy) => proxy.average_timeout < 1000
			// && proxy.anonymity === 'elite'
			// proxy.protocol === 'socks4' &&
			// proxy.alive &&
			// proxy.ip_data.proxy &&
			// !proxy.ip_data.mobile &&
			// proxy.ip_data.status === 'success'
			// (proxy.ip_data.continentCode === 'EU' || proxy.ip_data.continentCode === 'US')
		)
		.sort((a, b) => a.average_timeout - b.average_timeout);
};

/**
 * @description Check if proxies are working
 * @param {ProxyScrapeAPi[]} proxies List of proxies
 */
const checkProxy = async (proxies: ProxyScrapeAPi[]): Promise<ProxyScrapeAPi[]> => {
	const valToReturn: ProxyScrapeAPi[] = [];

	for (const proxy of proxies) {
		const controller = new AbortController();
		const signal: AbortSignal = controller.signal;
		const timeout = setTimeout(() => controller.abort(), 5000);

		try {
			const response = await fetch('https://api64.ipify.org?format=json', {
				signal: signal as any,
				method: 'GET',
				agent: new SocksProxyAgent(proxy.proxy)
			});

			clearTimeout(timeout);

			if (response.ok) {
				console.info(`✅ Proxy ok : ${proxy.proxy}`);
				valToReturn.push(proxy);
			}
		} catch (error) {
			console.info(`❌ Proxy dead : ${proxy.proxy}`);
		}
	}

	// Sort proxies by latency
	return valToReturn;
};

/**
 * @description Get the next proxy to use. Use this function to change proxy
 * @param {ProxyScrapeAPi[]} proxies List of proxies
 * @returns {Promise<string | null>} The next proxy to use
 */
const getNextProxy = async (proxies: ProxyScrapeAPi[]): Promise<string | null> => {
	nbTry++;
	nbProxy = proxies.length;

	if (nbTry >= nbProxy) {
		console.error('❌ --- All proxies have been used');
		return null;
	}

	console.info(
		`ℹ️ --- Proxy change : ${nbTry}/${nbProxy} ➡️ ${(proxies[nbTry] as ProxyScrapeAPi).proxy} ➡️ ${(proxies[nbTry] as ProxyScrapeAPi).ip_data.country}`
	);

	return (proxies[nbTry] as ProxyScrapeAPi).proxy ?? null;
};

const restartScraping = async (browser: Browser) => {
	await browser.close();
	const proxy = await getNextProxy(proxiesWorking);
	if (proxy) await scrape(proxy);
};

/**
 * @description Start scrapping
 * @param {string | null} proxy Proxy to use
 */
const scrape = async (proxy: string | null) => {
	puppeteer.use(StealthPlugin());
	puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

	const browser = await puppeteer.launch({
		headless: false,
		args: proxy
			? [
					`--proxy-server=${proxy}`,
					'--no-sandbox',
					// '--proxy-auto-detect',
					'--winhttp-proxy-resolver',
					'--ignore-certificate-errors',
					'--ignore-certificate-errors-spki-list'
				]
			: []
	});

	const page = await browser.newPage();
	setConsole(page);

	console.info('ℹ️ --- Start scrapping moteurimmo.fr');

	await page.setViewport({ width: 1920, height: 1080 });

	try {
		await page.goto('https://moteurimmo.fr/', { waitUntil: 'domcontentloaded', timeout: 60000 });

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
		await sleep(2000);

		console.info('ℹ️ --- Load localStorage done');
		const searchBtn = await page.waitForSelector('input[class^="button is-colored"]').catch(async () => {
			await restartScraping(browser);
		});

		if (searchBtn) {
			await searchBtn.click();
			console.info('ℹ️ --- Search button clicked');

			await sleep(3000);

			// Check limit modal appear
			let btnModalLimit = await page.$$('div[class="modal is-active"]');
			if (btnModalLimit.length > 0) {
				console.info('❌ --- Limit modal appear');
				await restartScraping(browser);
			}

			await autoScroll(page, { up: false });

			console.info('ℹ️ --- Wait for ads to load');

			await page.waitForSelector('div[class="column is-half"]').catch(async () => {
				await restartScraping(browser);
			});

			// Scroll to the start of the page
			await scroll(page, { up: true, distance: null });

			console.info('ℹ️ --- Search ads');

			const nbAds = await page.$$eval('div[class="column is-half"]', (elements: Element[]) => elements.length);
			console.info(`ℹ️ --- Found ${nbAds} ads`);

			// TODO: NEXT STEP SCROLL TO THE TOP AND SCRAPP STEP BY STEP WITH 12 ADS PER SCROLL

			await scroll(page, { up: false, distance: 1000 });

			const ads: Ad[] = await page.$$eval('div[class="column is-half"]', (elements: Element[]) =>
				elements.map((element) => {
					const title = element
						.querySelector('article[class="media columns is-multiline"]')
						?.children[0]?.children[0]?.querySelector('a');
					const img = element.querySelector('div[class="carousel-container"]')?.children[1]
						?.children[0] as HTMLImageElement;
					const price = element
						.querySelector('footer[class="card-footer-items columns is-multiline"]')
						?.children[1]?.querySelector('span')?.children[2];
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
						pricePerM2: pricePerM2, // `${pricePerM2} €/m²` : undefined,
						price: price ? (price.textContent?.trim() as string) : undefined,
						location: location ? location.split('à')[1]?.trimStart() : undefined
					} as Ad;
				})
			);

			await sleep(10000);
			console.info('✅ --- Done scrapping');
			await browser.close();
			console.log(ads);
		} else {
			console.error('❌ --- Search button not found');
			await browser.close();
		}
	} catch (error) {
		console.error('❌ --- Error while scrapping', error);
		await browser.close();

		console.info('⚠️ --- Try :', nbTry, '/', nbProxy);

		if (
			// (error as Error).message.includes('net::ERR_PROXY_CONNECTION_FAILED') ||
			// (error as Error).message.includes('net::ERR_TIMED_OUT') ||
			// (error as Error).message.includes('net::ERR_TUNNEL_CONNECTION_FAILED') ||
			// (error as Error).message.includes('net::ERR_CONNECTION_CLOSED') ||
			// (error as Error).message.includes('net::ERR_CONNECTION_RESET')
			nbTry <= nbProxy
		) {
			await restartScraping(browser);
		}
	}
};

const main = async () => {
	console.info('ℹ️ --- Start scrapping moteurimmo.fr');

	const allProxiesParsed = await getAndSortProxies();
	console.log('ℹ️ --- NB PROXY', allProxiesParsed.length);

	proxiesWorking = allProxiesParsed;
	// proxiesWorking = await checkProxy(allProxiesParsed);
	// if (proxiesWorking.length === 0) return;

	const proxy = await getNextProxy(allProxiesParsed);
	if (!proxy) return;

	console.info('ℹ️ --- Proxy used :', proxy);
	await scrape(proxy);
};

main();
