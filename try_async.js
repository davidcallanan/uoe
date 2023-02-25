export const try_async = async (func) => {
	try {
		return enm.ok(await func());
	} catch (e) {
		return enm.err(e);
	}
};

export const tryAsync = try_async;
