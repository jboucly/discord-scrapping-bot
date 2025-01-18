import { AdTrackerType } from '@prisma/client';
import { APIApplicationCommandOptionChoice } from 'discord.js';
import { AdTrackerTypeEnum } from '../enums/ad-tracker-type.enum';

export const GetAdTrackerTypeChoice = (): APIApplicationCommandOptionChoice<string>[] => {
	return Object.values(AdTrackerTypeEnum).map((value) => {
		switch (value) {
			case AdTrackerTypeEnum.LBC:
				return {
					value,
					name: 'LeBonCoin'
				};
			case AdTrackerTypeEnum.SE_LOGER:
				return {
					value,
					name: 'Se Loger'
				};

			default:
				throw new Error('Invalid ad tracker type');
		}
	});
};

export const getAdTrackerTypeTranslated = (type: AdTrackerType | AdTrackerTypeEnum): string => {
	switch (type) {
		case AdTrackerTypeEnum.LBC:
			return 'LeBonCoin';
		case AdTrackerTypeEnum.SE_LOGER:
			return 'Se Loger';

		default:
			throw new Error('Invalid ad tracker type');
	}
};
