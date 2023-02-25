import { create_async_factory } from "./create_async_factory.js";
import { unsuspended_api } from "./unsuspended_api.js";

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
 * export const create_api = create_unsuspended_factory(Api);
 */
export const create_unsuspended_factory = (cls) => {
	return unsuspended_api(create_async_factory(cls));
};

export const createUnsuspendedFactory = create_unsuspended_factory;
