import { map } from "./map.js";
import { call_as_async } from "./call_as_async.js";

// TODO: test
export const unsuspended_map = (func) => {
	const the_map = call_as_async(func);

	return map(async (input) => {
		return await (await the_map)(input);
	});
};

export const unsuspendedMap = unsuspended_map;
