import { Page } from 'puppeteer';

export const setConsole = (page: Page) => {
	page.on('console', async (msg) => {
		const msgArgs = msg.args();

		for (const element of msgArgs) {
			console.log(await element?.jsonValue());
		}
	});
};
