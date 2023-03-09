export const map_async = async function* (iterable, mapper) {
	let i = 0;

	for await (const item of iterable) {
		yield await mapper(item, i);
		i++;
	}
};

export const mapAsync = map_async;
