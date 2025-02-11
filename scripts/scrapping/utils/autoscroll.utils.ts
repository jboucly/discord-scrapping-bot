import { Page } from 'puppeteer';

export const autoScroll = async (page: Page) => {
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			let totalHeight = 0;
			const distance = 100;

			const timer = setInterval(() => {
				const scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;
				console.log('scroll', totalHeight, scrollHeight, window.innerHeight);

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer);
					resolve(null);
				}
			}, 700);
		});
	});
};
