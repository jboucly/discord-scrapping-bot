export const isValidHttpUrl = (string: string | undefined) => {
	let url;

	if (!string) return false;

	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === 'http:' || url.protocol === 'https:';
};
