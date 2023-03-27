const syntactic_sugar = (overall, curr) => new Proxy(curr ?? {}, {
	get: (target, prop) => {
		if (["type", "value"].includes(prop)) {
			return target[prop];
		}

		if (prop.includes(".")) {
			const [first, ...rest] = prop.split(".");
			return target[first][rest];
		}

		if (overall === undefined) {
			overall = {};
		}

		const result = (value) => {
			if (curr === undefined) {
				result.value = value;
			} else {
				curr.value.value = value;
			}

			return result;
		};

		Object.assign(result, overall);

		if (curr === undefined) {
			result.type = prop;
		} else {
			curr.value = { type: prop };
		}

		return syntactic_sugar(result, curr === undefined ? result : curr.value)
	},
});

/**
 * Constructs an enum object.
 * 
 * @example
 * 
 * const pet = enm.cat({ name: "Fluffy" });
 * const bate = enm.fish;
 * draw_animals(tup([pet, bate])({
 *   stroke: enm.no_stroke,
 *   fill: enm.with_fill.gradient(tup(enm.red, enm.blue))
 * }));
 */
export const enm = syntactic_sugar();
