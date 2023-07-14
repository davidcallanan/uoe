export const array_async_from = async (iterable) => {
	const result = [];

	for await (const item of iterable) {
		result.push(item);
	}

	return result;
};

export const arrayAsyncFrom = array_async_from;
