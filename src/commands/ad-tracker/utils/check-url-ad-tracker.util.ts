import { AdTrackerType } from '@prisma/client';

export const CheckUrlAdTrackerUtil = (url: string, type: AdTrackerType): boolean => {
	switch (type) {
		case AdTrackerType.LBC:
			return url.includes('https://www.leboncoin.fr/');
		case AdTrackerType.OUEST_FRANCE_IMMO:
			return url.includes('https://www.ouestfrance-immo.com/');
		case AdTrackerType.IMMOBILIER_NOTAIRE:
			return url.includes('https://www.immobilier.notaires.fr/');

		default:
			return false;
	}
};
