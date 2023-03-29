import { enm } from "./enm.js";
import { is_enm } from "./is_enm.js";
import { named_function } from "./named_function.js";

const symbol_is_map = Symbol("is_map");

const is_map = (obj) => typeof obj === "function" && obj[symbol_is_map];

const nil = Symbol("nil");

const cached = (func) => {
	let existing_result = nil;

	return (...args) => {
		if (existing_result === nil) {
			existing_result = func(...args);
		}

		return existing_result;
	};
};

export const map = (get) => {
	let final_map;

	let get_leaf = cached(() => Promise.resolve(get(undefined)));

	const raw_map = named_function(get.name, (input) => {
		if (input === undefined) {
			return get_leaf();
		}
		
		if (is_enm(input) && input.data !== undefined) {
			return raw_map(enm[input.sym])(input.data);
		}

		const get_output = cached(() => Promise.resolve(get(input)));

		return map(async (input) => {
			const output = await get_output();

			if (input === undefined) {
				if (is_map(output)) {
					return undefined;
				}

				return output;
			}

			if (is_map(output)) {
				return await output(input)();
			}

			return undefined;
		});
	});

	final_map = new Proxy(raw_map, {
		get: (_target, prop) => {
			if (prop === symbol_is_map) {
				return true;
			}

			if (prop === "then") {
				// Due to nested promise flattening, we cannot allow a map to be promise-like.
				// We must forcefully undefine the `then` property, as otherwise it would return another map which would classify it as a "thenable".
				// If access to the `then` enum is needed, you must explicitly call the map with this enum instead (`enm.$then`).
				return undefined;
			}

			return raw_map(enm[prop]);
		},
	});

	return final_map;
};
