export const enum_try_await = async (promise) => {
	try {
		return enm.ok(await promise);
	} catch (e) {
		return enm.err(e);
	}
};

export const enumTryAwait = enum_try_await;
