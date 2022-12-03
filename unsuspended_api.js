import { user_error, internal_error } from "./error.js";

/**
 * Takes in a promise to an async api and returns a wrapped api that can be invoked immediately.
 * 
 * An async api is either an object with async functions as its properties, an async function, or both.
 * 
 * All methods are proxied so that they can be invoked immediately. Upon invokation of any method, it will first wait for the underlying api to be ready before proceeding.
 * 
 * If the passed-in promise reports errors, these errors will instead be delayed to invocations of the api as internal errors. 
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
		} catch {}
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

				return api[prop](...args);
			};
		},
	});
};

export const unsuspendedApi = unsuspended_api;
