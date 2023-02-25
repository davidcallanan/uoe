export const try_await = async (promise) => {
	try {
		return enm.ok(await promise);
	} catch (e) {
		return enm.err(e);
	}
};

export const tryAwait = try_await;
