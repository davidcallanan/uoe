/**
 * @deprecated
 * 
 * Constructs a LEGACY tuple object.
 * 
 * @example
 * 
 * sum_vectors(tup(1, 2), tup(3, 4));
 * 
 * @example
 * 
 * const person = tup("John", "Doe")({
 *   age: 30,
 * });
 */
export const tup = (...fields) => {
	return new Proxy(fields, {
		apply: (_, __, [obj]) => {
			let result = [...fields];

			for (let key in obj) {
				result[key] = obj[key];
			}

			return result;
		},
	});
};
