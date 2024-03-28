/**
 * Creates a function that is dynamically named at run-time.
 */
export const named_function = (name, func) => {
	return { [name]: function(...args) { return Reflect.apply(func, this, args) } }[name];
};

export const namedFunction = named_function;
