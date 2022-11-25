import { internal_error } from "./error.js";

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

	return new Proxy(async (...args) => {
		const api = await get_api(api_promise);
		return await api(...args);
	}, {
		get: (_target, prop) => {
			if (prop.startsWith("_")) {
				return undefined;
			}

			return async (...args) => {
				const api = await get_api(api_promise);
				return api[prop](...args);
			};
		},
	});
};

export const unsuspendedApi = unsuspend_api;
