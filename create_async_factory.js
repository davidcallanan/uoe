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

		for (let key of Object.keys(obj)) {
			if (key.startsWith("_")) {
				continue;
			}

			if (typeof obj[key] === "function") {
				obj[key] = obj[key].bind(obj);
			}
		}

		return obj;
	};
};

export const createAsyncFactory = create_async_factory;
