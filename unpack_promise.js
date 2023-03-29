export const unpack_promise = (thenable) => {
	const promise = Promise.resolve(thenable);
	
	return {
		then: promise.then.bind(promise),
		catch: promise.catch.bind(promise),
		finally: promise.finally.bind(promise),
	};
};

export const unpackPromise = unpack_promise;
