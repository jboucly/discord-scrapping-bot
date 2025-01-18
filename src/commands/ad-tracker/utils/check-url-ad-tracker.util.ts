import { AdTrackerType } from '@prisma/client';

export const CheckUrlAdTrackerUtil = (url: string, type: AdTrackerType): boolean => {
	switch (type) {
		case AdTrackerType.LBC:
			return url.includes('https://www.leboncoin.fr/');
		case AdTrackerType.SE_LOGER:
			return url.includes('https://www.seloger.com/');

		default:
			return false;
	}
};
