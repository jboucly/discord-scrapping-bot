import { isNil } from 'lodash';

export const WordUtils = {
	getWords: (words: string | undefined): string[] => {
		if (isNil(words)) {
			return [];
		}

		if (words.includes(',') || words.includes(' ')) {
			return words.split(/,|\s/).filter((w) => w !== '');
		}

		return [words];
	}
};
