/**
 * Allows you to create a function that is dynamically named at run-time.
 */
export const named_function = (name, func) => {
	return { [name]: function(...args) { return func.apply(this, args) } }[name];
};

export const namedFunction = named_function;
