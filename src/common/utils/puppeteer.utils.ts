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

export const PuppeteerUtils = {
	autoScroll
};
