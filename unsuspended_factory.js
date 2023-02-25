import { unsuspended_api } from "./unsuspended_api.js"

/**
 * Takes in an async factory for an api and returns a sync factory for that api, achieved by unsuspending the api instance upon construction (see `unsuspended_api`).
 * 
 * Errors reported during the construction proccess will be delivered later, as described in `unsuspended_api`.
 * 
 * @example
 * 
 * const create_opengl_api = unsuspended_factory(async () => {
 *   const gl = await init_opengl();
 *   
 *   return {
 *     draw_triangle: async () => {
 *       await gl.draw_three_lines();
 *     },
 *   };
 * });
 * 
 * const opengl_api = create_opengl_api();
 * await opengl_api.draw_triangle();
 * console.log("triangle drawn");
 */
export const unsuspended_factory = (create) => {
	return (...args) => {
		return unsuspended_api(create(...args));
	};
};

export const unsuspendedFactory = unsuspended_factory;
