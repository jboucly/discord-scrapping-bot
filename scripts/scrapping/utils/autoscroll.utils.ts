import { Page } from 'puppeteer';

export const autoScroll = async (page: Page, opts: { up: boolean } = { up: false }) => {
	const { up } = opts;

	await page.evaluate(async (up) => {
		await new Promise((resolve) => {
			let totalHeight = 0;
			const distance = 100;

			if (up) {
				window.scrollTo(0, document.body.scrollHeight);
				resolve(null);
			} else {
				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy(0, distance);
					totalHeight += distance;
					console.log(`Scrolling... ${totalHeight}/${scrollHeight}`);

					if (totalHeight >= scrollHeight - window.innerHeight) {
						clearInterval(timer);
						resolve(null);
					}
				}, 300);
			}
		});
	}, up);
};

export const scroll = async (page: Page, opts: { up: boolean; distance: number | null }) => {
	await page.evaluate(async ({ distance, up }) => {
		if (up && distance) {
			window.scrollTo(0, -distance);
			console.info(`🔄 --- Scrolling... Distance : ${distance}`);
		} else if (up && !distance) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			console.info(`🔄 --- Scrolling... Distance : ${0}`);
		} else if (!up && distance) {
			console.info(`🔄 --- Scrolling... Distance : ${distance}`);
			window.scrollBy(0, distance);
		}
	}, opts);
};
