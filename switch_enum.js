export const switch_enum = (object, cases) => {
	if (cases[object.sym] === undefined) {
		console.warn("No case for", object);
		throw new Error(`No implementation found for \`${object.sym}\``);
	}

	return cases[object.sym](object.data);
};

export const switchEnum = switch_enum;
