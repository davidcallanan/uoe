export const simple_try_await = async (promise) => {
	try {
		return { value: await promise };
	} catch (e) {
		return { error: e };
	}
};

export const simpleTryAwait = simple_try_await;
