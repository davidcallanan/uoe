import { enm } from "./enum.js";

export const try_sync = (func) => {
	try {
		return enm.ok(func());
	} catch (e) {
		return enm.err(e);
	}
}

export const trySync = try_sync;
