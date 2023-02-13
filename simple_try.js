export const simple_try = (func) => {
	try {
		return { value: func() };
	} catch (e) {
		return { error: e };
	}
};

export const simpleTry = simple_try;
