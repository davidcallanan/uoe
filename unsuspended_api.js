
import { unsuspended_promise } from "./unsuspended_promise.js";

/**
 * @deprecated
 * 
 * Please use `unsuspended_promise` instead.
 */
export const unsuspended_api = (...args) => {
	console.warn("`unsuspended_api` is deprecated. Please use `unsuspended_promise` instead.");
	return unsuspended_promise(...args);
};

export const unsuspendedApi = unsuspended_api;
