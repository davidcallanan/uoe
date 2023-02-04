/**
 * Constructs an enum object.
 * 
 * @example
 * 
 * const pet = enm.cat({ name: "Fluffy" });
 * const bate = enm.fish;
 * draw_animals([pet, bate]);
 */
export const enm = new Proxy({}, {
	get: (_, prop) => {
		const e = (value) => {
			return {
				type: prop,
				value,
			};
		};

		e.type = prop;
		return e;
	},
});
