export const switch_enum = (object, cases) => {
	if (cases[object.type] === undefined) {
		console.warn("No case for", object);
		throw new Error(`No implementation found for \`${object.type}\``);
	}

	return cases[object.type](object.value);
};

export const switchEnum = switch_enum;
