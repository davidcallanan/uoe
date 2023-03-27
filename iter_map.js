export const map = function* (iterable, mapper) {
	let i = 0;

	for (const item of iterable) {
		yield mapper(item, i);	
		i++;
	}
};
