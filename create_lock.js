import { create_promise } from "./create_promise.js";
import { build_obj } from "./build_obj.js";
import { call_as_async } from "./call_as_async.js";

/**
 * @stability 2 - provisional
 * 
 * Creates a simple lock object with two methods, `acquire` and `acquire_immediately`.
 * 
 * The `acquire` method takes a callback and returns the callback's return value.
 * 
 * The `acquire_immediately` method will try to acquire the lock immediately, returning an object with both `.was_acquired` immediate and `.result` promise.
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
				return {
					was_acquired: false,
					result: undefined,	
				};
			} else {
				is_locked = true;
				
				const [result, res_result] = create_promise();

				call_as_async(callback).then((result) => {
					res_result(result);

					(async () => {
						if (outstanding_promises.length > 0) {
							const resolve = outstanding_promises.shift();
							resolve();
						} else {
							is_locked = false;
						}
					})();
				});

				return {
					was_acquired: true,
					result,
				};
			}
		},
	}, (o) => ({
		acquireImmediately: o.acquire_immediately,
	}));
};

export const createLock = create_lock;
