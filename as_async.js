/**
 * Properly converts any function to an async function.
 */

export const as_async = (possibly_async_func) => {
	// Not using arrow function to ensure `this` value is maintained.
	return async function (...args) {
		return await Reflect.apply(possibly_async_func, this, args);
	};
};

export const asAsync = as_async;
