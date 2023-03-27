import { enm } from "./enm.js";

const symbol_is_map = Symbol("is_map");

const is_map = (obj) => typeof obj === "function" && obj[symbol_is_map];

export const map = (get) => {
	const mapped_get = (input) => {
		if (input === undefined) {
			return Promise.resolve(get());
		}

		const result = get(input);
		
		if (is_map(result)) {
			return result;
		}

		return map((input) => {
			if (input === undefined) {
				return result;
			}
		});
	};

	const final_get = (input) => {
		if (input?.sym !== undefined) {
			return map(mapped_get(enm[input.sym]))(input.data);
		}

		return mapped_get(input);
	};

	return new Proxy(final_get, {
		get: (_target, prop) => {
			if (prop === symbol_is_map) {
				return true;
			}

			return final_get(enm[prop]);
		},
	});
};
