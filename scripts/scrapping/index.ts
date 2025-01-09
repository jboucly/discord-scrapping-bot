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

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer.launch({ headless: true }).then(async (browser) => {
	const page = await browser.newPage();
	await page.setViewport({ width: 1080, height: 1024 });

	await page.goto(
		'https://www.leboncoin.fr/recherche?category=9&text=maison&locations=Guipry-Messac_35480__47.82405_-1.80585_5000_10000&real_estate_type=1&price=min-290000&kst=r',
		{ waitUntil: 'domcontentloaded' }
	);

	await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });
	await sleep(2382);

	const ads: Ad[] = await page.$$eval('a[data-test-id="ad"]', (elements) =>
		elements.map((element) => {
			const ad: Ad = {
				url: element.getAttribute('href')
			};

			const img = element.querySelector('picture img');
			const title = element.querySelector('h2');
			const price = element.querySelector("p[data-test-id='price']");
			const pricePerM2 = price?.parentElement?.children[1];
			const location = element.querySelector("p[aria-label*='Située à']");

			if (title) {
				Object.assign(ad, { title: title.innerText.trim() });
			}

			if (img) {
				Object.assign(ad, { img: img.getAttribute('src') });
			}

			if (price) {
				Object.assign(ad, { price: price.textContent?.trim() });
			}

			if (pricePerM2 && pricePerM2.textContent !== title?.innerText) {
				Object.assign(ad, { pricePerM2: pricePerM2.textContent?.trim() });
			}

			if (location) {
				Object.assign(ad, { location: location.textContent?.trim() });
			}

			return ad;
		})
	);

	await browser.close();
	console.log(ads);
	console.log(ads.length);
});
