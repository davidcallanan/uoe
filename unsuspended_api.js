import { user_error, internal_error } from "./error.js";

/**
 * Wraps an api or promise to an api such that the api is immediately available. Properties and methods, including sub-properties of the api and sub-properties of the return-values of methods, are proxied to be immediately accessible before the api has neccesserily been resolved, and before parent properties and return-values of parent methods have been resolved. However, this means that the properties and methods are forced to be async.
 * 
 * Upon access of a property or invocation of the wrapped api, it will first wait for the underlying api to be resolved before proceeding.
 * 
 * If errors are reported by the passed-in promise, these errors will instead be delivered as internal errors inside any promises obtained from the wrapped api.
 * 
 * Warning: The `then`, `catch` and `finally` properties must not be defined on the underlying api as this makes the underlying api promise-like, while also conflicting with our implementation of the promise interface at every level.
 * Doing this will cause bizarre behaviour which may be difficult to track down.
 * 
 * @example
 * 
 * const api = unsuspended_api(api_promise);
 * 
 * // The following two lines of code are equivalent
 * await api;
 * await api_promise;
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
 * const opengl_api = unsuspended_api(create_opengl_api());
 * await opengl_api.draw_triangle();
 * console.log("triangle drawn");
 */

export const unsuspended_api = (api_promise_like, ctx) => {
	const api_promise = Promise.resolve(api_promise_like);

	return new Proxy((...args) => {
		return unsuspended_api((async () => {
			const api = await api_promise;

			if (typeof api !== "function") {
				if (ctx?.$$$_READING_PROP) {
					throw new TypeError(`${api} is not a function (reading property ${ctx.$$$_READING_PROP})`);
				}
				
				throw new TypeError(`${api} is not a function`);
			}

			return await Reflect.apply(api, api, args);
		})());
	}, {
		get: (_target, prop) => {
			if (["then", "catch", "finally"].includes(prop)) {
				return api_promise[prop].bind(api_promise);
			}

			return unsuspended_api((async () => {
				const api = await api_promise;

				if (typeof api[prop] === "function") {
					return api[prop].bind(api);
				}

				return api[prop];
			})(), {
				$$$_READING_PROP: prop,
			});
		},
	});
};

export const unsuspendedApi = unsuspended_api;
