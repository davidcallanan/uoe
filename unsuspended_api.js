import { user_error, internal_error } from "./error.js";

/**
 * Wraps an api or promise to an api such that the api is immediately available. Properties and methods, including sub-properties of the api and sub-properties of the return-values of methods, are proxied to be immediately accessible before the api has neccesserily been resolved, and before parent properties and return-values of parent methods have been resolved. However, this means that the properties and methods are forced to be async.
 * 
 * @example
 * 
 * const api = unsuspended_api(api_promise);
 * 
 * // The following two lines of code are equivalent
 * await api();
 * await (await api_promise)();
 * 
 * // The following two lines of code are equivalent
 * await api.property;
 * await (await api_promise).property;
 * 
 * // The following three lines of code are equivalent
 * await api.method();
 * await unsuspended_api(await api.method)();
 * await (await (await api_promise).method)();
 * 
 * // The following four lines of code are equivalent
 * await api.method().property;
 * await unsuspended_api(await api.method()).property;
 * await unsuspended_api(await api.method()).property;
 * await unsuspended_api(unsuspended_api(await api.method)()).property;
 * await (await (await (await api_promise).method)()).property;
 * 
 * // As you can see, unsuspending an api removes a lot of await statements.
 * // This offers a high degree of flexibility when working with asynchronous code.
 * 
 * // TODO: update implementation to match new desired functionality as documented here.
 * 
 * @example
 * 
 * const create_opengl_api = async () => {
 *   const gl = await init_opengl();
 *   
 *   return {
 *     draw_triangle: async () => {
 *       await gl.draw_three_lines();
 *     },
 *   };
 * };
 * 
 * const opengl_api = unsuspend_api(create_opengl_api());
 * await opengl_api.draw_triangle();
 * console.log("triangle drawn");
 */

export const unsuspended_api = (api_promise) => {
	const get_api = async (api_promise) => {
		try {
			return await api_promise;
		} catch (e) {
			throw internal_error("Unable to initialize API", e);
		}
	};

	(async () => {
		try {
			(await api_promise).then !== undefined &&
				console.warn("Resolved api object must not be thenable due to a JavaScript promises anomoly. The then property has been forcefully unset.");
			;
		} catch (e) {
			console.error(e);
		}
	})();

	return new Proxy(async (...args) => {
		const api = await get_api(api_promise);
		return await api(...args);
	}, {
		get: (_target, prop) => {
			if (prop === "then") {
				// We need to make sure the final object is not "thenable", that is, not "promise-like".
				// This is due to an anomoly with the promises implementation where thenable objects are treated differently than regular objects during resolution.
				// This would prevent the final object from ever being resolved for a promise.
				// Promises are so widely used that it would not take long for this to cause major problems.
				// As such, we are forced to forcefully unset the "then" property on the final object.
				// It only took a full day's work to track down a bug caused by this anomoly.

				return undefined;
			}

			if (prop.startsWith("_")) {
				return undefined;
			}

			return async (...args) => {
				const api = await get_api(api_promise);

				if (typeof api[prop] !== "function") {
					if (api[prop] !== undefined) {
						console.error(api[prop]);
					}

					throw user_error(`API does not have method ${prop}`);
				}

				return await api[prop](...args);
			};
		},
	});
};

export const unsuspendedApi = unsuspended_api;
