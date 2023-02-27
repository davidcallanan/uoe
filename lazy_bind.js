import { callable } from "./callable.js";

/**
 * Binds the `this` value of a function lazily.
 * 
 * Takes in a `lazy_this_value` function that returns the `this` value to be used.
 */
export const lazy_bind = (func, lazy_this_value) => {
	return callable(func, (...args) => Reflect.apply(func, lazy_this_value(), args));
};
