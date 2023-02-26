/**
 * Binds the `this` value of a function lazily.
 * 
 * Takes in a `lazy_this_value` function that returns the `this` value to be used.
 */
export const lazy_bind = (func, lazy_this_value) => {
	return callable(func, (...args) => func.apply(lazy_this_value(), args));
};
