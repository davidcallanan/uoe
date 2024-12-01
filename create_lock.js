import { create_promise } from "./create_promise.ts";
import { build_obj } from "./build_obj.js";

/**
 * Creates a simple lock object with two methods, `acquire` and `acquire_immediately`.
 * 
 * The `acquire` method takes a callback and returns the callback's return value.
 * 
 * The `acquire_immediately` method will try to acquire the lock immediately and will invoke the callback with a boolean indicating whether the lock was succesful.
 * 
 * This implementation is prone to circular deadlocks.
 */
export const create_lock = () => {
	let is_locked = false;
	const outstanding_promises = [];
	
	return build_obj({
		async acquire(callback) {
			await (() => {
				if (!is_locked) {
					is_locked = true;
					return Promise.resolve();
				}
	
				const [promise, res, _rej] = create_promise();
				outstanding_promises.push(res);
				return promise;
			})();
	
			try {
				var result = await callback();
			} catch (e) {
				console.error(e);
				console.warn("Alert! Lock released following error.");
			}
	
			(async () => {
				if (outstanding_promises.length > 0) {
					const resolve = outstanding_promises.shift();
					resolve();
				} else {
					is_locked = false;
				}
			})();
	
			return result;
		},
		async acquire_immediately(callback) {
			if (is_locked) {
				return await callback(false);
			} else {
				is_locked = true;
				const result = await callback(true);
	
				(async () => {
					if (outstanding_promises.length > 0) {
						const resolve = outstanding_promises.shift();
						resolve();
					} else {
						is_locked = false;
					}
				})();
	
				return result;
			}
		},
	}, (o) => ({
		acquireImmediately: o.acquire_immediately,
	}));
};

export const createLock = create_lock;
