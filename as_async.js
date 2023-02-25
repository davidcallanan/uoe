export const as_async = (possibly_async_func) => {
	return async (...args) => {
		return await possibly_async_func(...args);
	};
};

export const asAsync = as_async;
