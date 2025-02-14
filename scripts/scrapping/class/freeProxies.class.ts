import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyScrapeAPi, ProxyScrapeApiResponse } from '../types/proxyScrape.type';

/**
 * @class FreeProxies
 * @todo Implement rotation of proxies for proxies working
 * @description Class to get and use free proxies
 */
export class FreeProxies {
	private nbProxy = 0;
	private nbTry = -1;
	private proxiesWorking: (ProxyScrapeAPi | string)[] = [];

	/**
	 * @description Get free proxies from proxyscrape.com and sort them by latency
	 * @returns {Promise<ProxyScrapeAPi[]>} List of proxies
	 */
	public getAndSortProxies = async (): Promise<ProxyScrapeAPi[]> => {
		// Url to get proxies list from github
		// const allProxiesListUrl = await fetch(
		// 	'https://github.com/Leinad4Mind/1fichier-dl/blob/main/https_proxy_list.txt?raw=true'
		// );
		const allProxies = await fetch(
			'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json'
		);
		const res: ProxyScrapeApiResponse = await allProxies.json();

		return res.proxies
			.filter(
				(proxy) => proxy.average_timeout < 1000
				// && proxy.anonymity === 'elite'
				// proxy.protocol === 'socks4' &&
				// proxy.alive &&
				// proxy.ip_data.proxy &&
				// !proxy.ip_data.mobile &&
				// proxy.ip_data.status === 'success'
				// (proxy.ip_data.continentCode === 'EU' || proxy.ip_data.continentCode === 'US')
			)
			.sort((a, b) => a.average_timeout - b.average_timeout);
	};

	/**
	 * @description Check if proxies are working
	 * @param {ProxyScrapeAPi[]} proxies List of proxies
	 */
	public async checkProxy(proxies: ProxyScrapeAPi[]): Promise<ProxyScrapeAPi[]> {
		const valToReturn: ProxyScrapeAPi[] = [];

		for (const proxy of proxies) {
			const controller = new AbortController();
			const signal: AbortSignal = controller.signal;
			const timeout = setTimeout(() => controller.abort(), 5000);

			try {
				const response = await fetch('https://api64.ipify.org?format=json', {
					signal: signal as any,
					method: 'GET',
					agent: new SocksProxyAgent(proxy.proxy)
				});

				clearTimeout(timeout);

				if (response.ok) {
					console.info(`✅ Proxy ok : ${proxy.proxy}`);
					valToReturn.push(proxy);
				}
			} catch (error) {
				console.info(`❌ Proxy dead : ${proxy.proxy}`);
			}
		}

		// Sort proxies by latency
		return valToReturn;
	}

	/**
	 * @description Get the next proxy to use. Use this function to change proxy
	 * @param {(ProxyScrapeAPi | string)[]} proxies List of proxies
	 * @returns {Promise<string | null>} The next proxy to use
	 */
	public async getNextProxy(proxies: (ProxyScrapeAPi | string)[]): Promise<string | null> {
		this.nbTry++;
		this.nbProxy = proxies.length;

		const proxyUrl = (proxies[this.nbTry] as ProxyScrapeAPi).proxy ?? (proxies[this.nbTry] as string);

		if (this.nbTry >= this.nbProxy) {
			console.error('❌ --- All proxies have been used');
			return null;
		}

		console.info(
			`ℹ️ --- Proxy change : ${this.nbTry}/${this.nbProxy} ➡️ ${proxyUrl} ➡️ ${typeof proxies[this.nbTry] === 'object' ? (proxies[this.nbTry] as any).ip_data.country : 'Unknown'}`
		);

		return proxyUrl;
	}
}
