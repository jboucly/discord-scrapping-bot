export interface FreeWorkJob {
	'@id': string;
	'@type': string;
	id: number;
	title: string;
	slug: string;
	description: string;
	candidateProfile: string | null;
	companyDescription: string;
	experienceLevel: string;
	minAnnualSalary: null | string;
	maxAnnualSalary: null | string;
	minDailySalary: null | string;
	maxDailySalary: null | string;
	currency: string;
	duration: number;
	durationValue: number;
	durationPeriod: string;
	renewable: boolean;
	remoteMode: string;
	applicationType: string;
	applicationContact: string | null;
	applicationUrl: string | null;
	applicationEmail: string | null;
	applicationsCount: number;
	location: {
		'@type': string;
		'@id': string;
		street: null;
		locality: string;
		postalCode: null | string;
		adminLevel1: null | string;
		adminLevel2: null | string;
		country: string;
		countryCode: string;
		latitude: string;
		longitude: string;
		key: string;
		label: string;
		shortLabel: string;
	};
	startsAt: Date | null;
	reference: string | null;
	company: {
		'@id': string;
		'@type': string;
		id: number;
		name: string;
		slug: string;
		description: string;
		location: {
			'@type': string;
			'@id': string;
			street: string | null;
			locality: string;
			postalCode: string;
			adminLevel1: string;
			adminLevel2: string;
			country: string;
			countryCode: string;
			latitude: string;
			longitude: string;
			key: string;
			label: string;
			shortLabel: string;
		};
		logo: {
			small: string;
			medium: string;
		};
		directoryFreeWork: true;
		coverPicture: null;
	};
	job: {
		'@id': string;
		'@type': string;
		id: number;
		name: string;
		slug: string;
		nameForContribution: string;
		nameForContributionSlug: string;
	};
	skills: {
		'@id': string;
		'@type': string;
		id: number;
		name: string;
		slug: string;
	}[];
	createdAt: Date;
	updatedAt: Date;
	publishedAt: Date;
	status: string;
	softSkills: {
		'@id': string;
		'@type': string;
		id: number;
		name: string;
		slug: string;
	}[];
	expiredAt: Date;
	source: null | string;
	origin: null | string;
	contracts: string[];
	annualSalary: null | string;
	dailySalary: null | string;
	published: boolean;
}

export interface FreeWorkJobs {
	'@context': string;
	'@id': string;
	'@type': string;
	'hydra:totalItems': number;
	'hydra:member': FreeWorkJob[];
}
