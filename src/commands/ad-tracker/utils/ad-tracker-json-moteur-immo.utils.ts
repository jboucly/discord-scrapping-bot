export const MotorImmoLocalStorageKeyToValidate = ['searchType'];

export const CheckMotorImmoLocalStorageQuery = (value: string): boolean => {
	let parsed: Record<string, string>;

	try {
		parsed = JSON.parse(value);
	} catch (_error) {
		return false;
	}

	const keys = Object.keys(parsed);

	if (
		keys.length === 0 ||
		MotorImmoLocalStorageKeyToValidate.some((key) => !keys.includes(key)) ||
		parsed['searchType'] !== 'classic'
	) {
		return false;
	}

	return true;
};
