export const as_async = (possibly_async_func) => {
	return async (...args) => {
		return await possibly_async_function(...args);
	};
};

export const asAsync = as_async;
