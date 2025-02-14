import { Page } from 'puppeteer';
import { IMG_DOMAIN_AUTHORIZED } from '../constants/imgDomainAuthorised.constant';

/**
 * @description Use this method for blocking requests on a page for limit the consumption of data
 */
export const blockRequest = async (page: Page) => {
	page.on('request', async (request) => {
		if (
			request.resourceType() === 'media' ||
			request.resourceType() === 'font' ||
			request.resourceType() === 'manifest' ||
			request.url().endsWith('.pdf') ||
			request.url().includes('favicon.ico') ||
			request.url().includes('track')
		) {
			request.abort();
		} else if (request.resourceType() === 'image') {
			const imageUrl = request.url();
			const isAuthorized = IMG_DOMAIN_AUTHORIZED.some((domain) => imageUrl.startsWith(domain));

			if (isAuthorized) {
				await request.continue();
			} else {
				await request.abort();
			}
		} else {
			await request.continue();
		}
	});
};
