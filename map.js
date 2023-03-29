import { enm } from "./enm.js";
import { is_enm } from "./is_enm.js";
import { unpack_promise } from "./unpack_promise.js";

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

	const raw_map = (input) => {
		if (input === undefined) {
			return final_map;
		}
		
		if (is_enm(input) && input.data !== undefined) {
			console.log("accessing symbol", input.sym, input.data);
			return raw_map(enm[input.sym])(input.data);
		}

		const get_output = cached(() => Promise.resolve(get(input)));

		return map(async (input) => {
			const output = await get_output();

			if (input === undefined) {
				return output;
			}

			if (is_map(output)) {
				return output(input);
			}

			return undefined;
		});
	};

	final_map = new Proxy(raw_map, {
		get: (_target, prop) => {
			if (prop === symbol_is_map) {
				return true;
			}

			if (prop === "then") {
				// Turns the map into a "thenable" for obtaining the leaf value.
				// One must use `Promise.resolve` if access to `catch` or `finally` is needed.
				// If access to the underlying `then` enum is needed, you must explicitly call the map with this enum instead.
				return unpack_promise(get_leaf()).then;
			}

			return raw_map(enm[prop]);
		},
	});

	return final_map;
};
