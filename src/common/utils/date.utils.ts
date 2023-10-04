export const DateUtils = {
	isTimeFormatCorrect: (time: string): boolean => {
		return time.includes(':') && time.split(':').length === 2;
	},
};
