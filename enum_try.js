import { enm } from "./enum.js";

export const enum_try = (func) => {
	try {
		return enm.ok(func());
	} catch (e) {
		return enm.err(e);
	}
}
