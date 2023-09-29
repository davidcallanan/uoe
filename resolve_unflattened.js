import { create_promise } from "./create_promise.ts";

/**
 * @deprecated
 * 
 * Similar to `Promise.resolve` but does not flatten nested layers of promise-like objects.
 * 
 * NEVERMIND: This does not work. It's seems to be impossible!
 */
export const resolve_unflattened = (potential_thenable) => {
	let [promise, res, rej] = create_promise();

	if (thenable?.then !== undefined) {
		const thenable = potential_thenable;
		thenable.then(res);
		thenable.catch?.(rej);
		return promise;
	}

	const non_thenable = potential_thenable;
	return Promise.resolve(non_thenable)
};

export const resolveUnflattened = resolve_unflattened;
