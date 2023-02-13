export const enum_try_async = async (func) => {
	try {
		return enm.ok(await func());
	} catch (e) {
		return enm.err(e);
	}
};

export const enumTryAsync = enum_try_async;
