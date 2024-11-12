import { test } from "./test.js";
import { map } from "./map.js";
import { unsuspended_promise } from "./unsuspended_promise.js";
import { obtain_map } from "./obtain_map.js";

const mix = (map) => {
	const m1 = map;
	const p1 = unsuspended_promise(m1);
	const m2 = obtain_map(p1);
	const p2 = unsuspended_promise(m2);
	const m3 = obtain_map(p2);
	const p3 = unsuspended_promise(m3);
	const m4 = obtain_map(p3);

	return m4;
};

await test("basic test", async () => {
	const m = mix(map((input) => {
		if (input === undefined) {
			return "hello";
		}

		return "world";
	}));

	return await m() === "hello" && await m.foo() === "world";
});

await test("unsuspension", async () => {
	const m = mix(map((input) => {
		if (input === undefined) {
			return "hello";
		}

		return "world";
	}));

	const m2 = unsuspended_promise(m);

	return await m2() === "hello" && await m2.foo() === "world";
});

await test("complex test", async () => {
	const m = mix(map((input) => {
		if (input === undefined) {
			return undefined;
		}

		return mix(map((input) => {
			if (input === undefined) {
				return "hello";
			}
		}));
	}));

	return await m.test() === "hello";
});

await test("complex test 2", async () => {
	const m = mix(map((input) => {
		if (input === undefined) {
			return undefined;
		}

		return mix(map((input) => {
			if (input === undefined) {
				return undefined;
			}

			return mix(map((input) => {
				if (input === undefined) {
					return "hello";
				}
			}));
		}));
	}));

	return await m.test.test() === "hello";
});
