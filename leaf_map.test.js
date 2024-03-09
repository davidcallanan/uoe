import { test } from "./test.js";
import { leaf_map } from "./leaf_map.js";

await test("leaf_map", async () => {
	return await leaf_map("foo")() === "foo";
});
