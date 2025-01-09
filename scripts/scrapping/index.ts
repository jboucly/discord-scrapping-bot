import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

type Ad = {
	url: string | null;
	title?: string;
	img?: string;
	price?: string;
	pricePerM2?: string;
	location?: string;
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const autoScroll = async (page: Page) => {
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer);
					resolve(null);
				}
			}, 100);
		});
	});
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

		for (let i = 0; i < msgArgs.length; ++i) {
			console.log(await msgArgs[i]?.jsonValue());
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
