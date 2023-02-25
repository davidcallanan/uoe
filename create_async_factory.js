import { as_async } from "./as_async.js";

/**
 * @example
 * 
 * class Api {
 *   constructor(foo, bar) { ... }
 * 
 *   async _init() {
 *     await some_initialization_logic();
 *   }
 * 
 *   ...
 * }
 * 
 * export const create_api = create_async_factory(Api);
 */
export const create_async_factory = (cls) => {
	return async (...args) => {
		const obj = new cls(...args);
		obj._init && await obj._init();

		const result = obj._call !== undefined ? as_async(obj._call) : obj;
		Object.assign(result, obj);

		for (const key in result) {
			if (typeof key === "function") {
				result[key] = result[key].bind(result);
			}
		}
		
		return result;
	};
};

export const createAsyncFactory = create_async_factory;
