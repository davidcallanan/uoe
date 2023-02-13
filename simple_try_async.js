export const simple_try_async = async (func) => {
	try {
		return { value: await func() };
	} catch (e) {
		return { error: e };
	}
};

export const simpleTryAsync = simple_try_async;
