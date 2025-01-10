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
			devtools: false,
			// executablePath: process.env.CHROME_BIN ?? '/app/.chrome-for-testing/chrome-linux64/chrome',
			args: [
				'--no-sandbox',
				'--devtools-flags=disable'
				// '--disable-setuid-sandbox',
				// '--disable-dev-shm-usage',
				// '--disable-gpu',
				// '--no-zygote',
				// '--single-process'
			]
		};
	}

	return { headless: true };
};

const setConsoleEvents = (page: Page) => {
	page.on('console', async (msg) => {
		const msgArgs = msg.args();

		for (let i = 0; i < msgArgs.length; ++i) {
			console.log(await msgArgs[i]?.jsonValue());
		}
	});
};

export const PuppeteerUtils = {
	autoScroll,
	getBrowserConfig,
	setConsoleEvents
};
