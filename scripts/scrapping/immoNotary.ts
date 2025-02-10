/**
 * Script test to scrap immobilier.notaires.fr website
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
		'https://www.immobilier.notaires.fr/fr/annonces-immobilieres-liste?page=1&parPage=12&localiteGlobale=9242&surfaceMin=100&prixMax=300000&localite=16012,15847&typeTransaction=VENTE,VNI,VAE&typeBien=MAI',
		{ waitUntil: 'domcontentloaded' }
	);

	await autoScroll(page);
	await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });
	await sleep(2382);

	const cookieButton = await page.waitForSelector('button[class="tarteaucitronCTAButton tarteaucitronDeny"]');

	if (cookieButton) {
		await cookieButton.click();
		await cookieButton.dispose();
		await sleep(3000);
		await page.waitForSelector('div[class="colonne_liste_annonces"]');
	}

	await page.screenshot({ path: `./screen/${new Date().toISOString()}-annonces.png`, fullPage: true });

	const ads: Ad[] = await page.$$eval('inotr-bloc-annonce', (elements: Element[]) =>
		elements.map((element) => {
			const img = element.querySelector('div[class="container_photo"]')?.querySelector('a img');
			const title = element.querySelector('h2');
			const price = element.querySelector('div[class="valeur"]');
			const location = title?.querySelector('span[class="localisation"]')?.textContent?.trim();

			console.log(title);

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
	console.log(ads);
});
