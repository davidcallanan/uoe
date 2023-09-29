import { bind_self } from "./bind_self.js";
import { callable } from "./callable.js";

/**
 * Similar to `callable` but additionally binds the result to itself.
 */
export const callable_bound = (obj, call) => {
	return bind_self(callable(obj, call));
};
