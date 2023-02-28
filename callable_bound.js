import { bind_self } from "./bind_self.js";
import { callable } from "./callable.js";

export const callable_bound = (obj, call) => {
	return bind_self(callable(obj, call));
};
