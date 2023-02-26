/**
 * Makes an object callable.
 * 
 * Returns a resulting object such that when the object is called, the provided function is invoked.
 * The rest of the resulting object is proxied to the original provided object.
 */
export const callable = (obj, call) => {
	return new Proxy(obj, {
		apply: (_target, _this_value, args) => {
			return call.apply(obj, args);
		},
	});
};
