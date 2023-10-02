/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync
 */
export const array_from_async = async (iterable) => {
	const result = [];

	for await (const item of iterable) {
		result.push(item);
	}

	return result;
};

export const arrayFromAsync = array_from_async;
