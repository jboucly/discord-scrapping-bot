import { AdTrackers } from '@prisma/client';
import { Ad } from '../types/ad.type';

export interface ITrackerProvider {
	getAds(adTracker: AdTrackers): Promise<Ad[]>;
}
