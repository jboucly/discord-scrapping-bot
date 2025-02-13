export type ProxyAnonymity = 'elite' | 'transparent';
export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5';

export type ProxyIpData = {
	as: string;
	asname: string;
	city: string;
	continent: string;
	continentCode: string;
	country: string;
	countryCode: string;
	district: string;
	hosting: boolean;
	isp: string;
	lat: number;
	lon: number;
	mobile: boolean;
	org: number;
	proxy: boolean;
	regionName: string;
	status: 'success' | 'fail';
	timezone: string;
	zip: string;
};

export type ProxyScrapeAPi = {
	alive: boolean;
	alive_since: number;
	anonymity: ProxyAnonymity;
	average_timeout: number;
	first_seen: number;
	ip_data: ProxyIpData;
	ip_data_last_update: number;
	last_seen: number;
	port: number;
	protocol: ProxyProtocol;
	proxy: string;
	ssl: boolean;
	timeout: number;
	times_alive: number;
	times_dead: number;
	uptime: number;
	ip: string;
};

export type ProxyScrapeApiResponse = {
	shown_records: number;
	total_records: number;
	limit: number;
	skip: number;
	nextpage: boolean;
	proxies: ProxyScrapeAPi[];
};
