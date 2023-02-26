import { callable } from "./callable.js";

/**
 * Binds a function's `this` value to itself.
 * 
 * This is useful for creating callable objects where `this` refers to the callable object itself.
 */
export const bind_self = (func) => {
	return callable(func, func);
};
