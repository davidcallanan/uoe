import { create_async_factory } from "./create_async_factory.js";
import { unsuspended_factory } from "./unsuspended_factory.js";

export const create_service_factory = (cls) => {
	return unsuspended_factory(async (...args) => {
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
	});
};

export const createUnsuspendedFactory = create_unsuspended_factory;
