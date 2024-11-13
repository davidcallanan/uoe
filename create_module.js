import { as_async } from "./as_async.js";

/**
 * Creates a module which is an intermediate organizational tool for building a map.
 * 
 * It handles:
 * 
 * 1. Initialization
 * 2. Environment (dependency) capturing
 * 3. Self-referencing
 * 4. Segregating implementation into chunks, for the purpose of allowing the developer to split the implementation across files.
 * 5. Obtaining a final map factory for export.
 * 
 * Takes in an async initialization function, which takes in the environment (a map) provided by the developer when they invoke the map factory, and returns an updated environment which is passed to your implementation, allowing for any needed initialization logic.
 */
export const create_module = (init) => {
	const init_async = as_async(init);

	return {
		create_map_factory: () => {
			return (env) => obtain_map((async () => {
				const new_env_candidate = await init_async(env);
				const new_env = new_env_candidate ?? env;

				return map((input) => {
					throw "Not implemented.";
				});
			})());
		},
	};
};

// Example usage:

// const module = create_module(async (env) => {
// 	// iniitalization logic here.
// });

// module.implement((ctx, env) => {
// 	ctx.define("foo", () => {

// 	});
// });

// export default (module, env) => {
// 	module.public("foo", )
// };

// export default module.create_map_factory();
