import { create_promise } from "./create_promise.js";
import { build_obj } from "./build-obj.js";

/**
 * This implementation is prone to circular deadlocks.
 */
export const create_lock = () => {
	let is_locked = false;
	let outstanding_promises = [];
	
	return build_obj({
		async acquire(callback) {
			await (() => {
				if (!is_locked) {
					is_locked = true;
					return Promise.resolve();
				}
	
				let [promise, res, _rej] = create_promise();
				outstanding_promises.push(res);
				return promise;
			});
	
			let result = await callback();
	
			(async () => {
				if (outstanding_promises.length > 0) {
					let resolve = outstanding_promises.shift();
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
				let result = await callback(true);
	
				(async () => {
					if (outstanding_promises.length > 0) {
						let resolve = outstanding_promises.shift();
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
