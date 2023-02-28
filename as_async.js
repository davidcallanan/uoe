export const as_async = (possibly_async_func) => {
	// Not using arrow function to ensure `this` value is maintained.
	return async function (...args) {
		return await possibly_async_func(...args);
	};
};

export const asAsync = as_async;
