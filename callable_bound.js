import { lazy_bind } from "./lazy_bind.js";
import { callable } from "./callable.js";

export const callable_bound = (obj, call) => {
	const result = lazy_bind(callable(obj, call), () => result);
	return result;
};
