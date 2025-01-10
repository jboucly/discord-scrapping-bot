import { Page } from 'puppeteer';

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

const getBrowserConfig = () => {
	if (process.env.NODE_ENV === 'production') {
		return {
			headless: true,
			executablePath: process.env.CHROME_BIN || '/app/.apt/usr/bin/google-chrome',
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--no-zygote',
				'--single-process'
			]
		};
	}

	return { headless: true };
};

export const PuppeteerUtils = {
	autoScroll,
	getBrowserConfig
};
