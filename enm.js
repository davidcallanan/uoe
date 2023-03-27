const syntactic_sugar = (overall, curr) => new Proxy(curr ?? {}, {
	get: (target, prop) => {
		if (["sym", "data"].includes(prop)) {
			return target[prop];
		}

		if (prop.includes(".")) {
			const [first, ...rest] = prop.split(".");
			return target[first][rest];
		}

		if (overall === undefined) {
			overall = {};
		}

		const result = (data) => {
			if (curr === undefined) {
				result.data = data;
			} else {
				curr.data.data = data;
			}

			return result;
		};

		Object.assign(result, overall);

		if (curr === undefined) {
			result.sym = prop;
		} else {
			curr.data = { sym: prop };
		}

		return syntactic_sugar(result, curr === undefined ? result : curr.data)
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
