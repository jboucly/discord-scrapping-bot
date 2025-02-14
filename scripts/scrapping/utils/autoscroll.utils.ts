import { Page } from 'puppeteer';

export const autoScroll = async (page: Page, opts: { up: boolean } = { up: false }) => {
	const { up } = opts;

	await page.evaluate(async (up) => {
		await new Promise((resolve) => {
			let totalHeight = 0;
			const distance = 100;

			if (up) {
				const scrollStep = -window.scrollY / 50;
				const interval = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;
					totalHeight += distance;

					if (window.scrollY <= 0) {
						clearInterval(interval);
						resolve(null);
					}
					window.scrollBy(0, scrollStep);
					console.info(`ℹ️ --- Scrolling... ${totalHeight}/${scrollHeight}`);
				}, 100);
			} else {
				const timer = setInterval(() => {
					const scrollHeight = document.body.scrollHeight;

					window.scrollBy(0, distance);
					totalHeight += distance;
					console.info(`ℹ️ --- Scrolling... ${totalHeight}/${scrollHeight}`);

					if (totalHeight >= scrollHeight - window.innerHeight) {
						clearInterval(timer);
						resolve(null);
					}
				}, 100);
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
