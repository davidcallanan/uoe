import { map } from "./map.js";
import { is_enm } from "./is_enm.js";

const create_tup = (positional_fields, named_fields) => {
	const m = map((input) => {
		if (input === undefined) {
			return undefined; // TODO: do we want to return the first element?
		}

		if (typeof input === "object") {
			return create_tup(positional_fields, {
				...named_fields,
				...input,
			});
		}

		if (is_enm(input)) {
			const pos = parseInt(input.sym);

			if (isNaN(pos)) {
				return named_fields[input.sym];
			} else {
				return positional_fields[pos];
			}
		}
	});

	return m;
};

/**
 * Constructs a tuple object.
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
 * 
 * console.log(await person[0]());
 * console.log(await person[1]());
 * console.log(await person.age());
 */
export const tup = (...fields) => {
	return create_tup(fields, {});
};
