import { test } from "../test.js";
import { e } from "./e.js";
import { is_enm } from "../is_enm.js";

await test("constant", async () => {
	const number = 123n;
	return await e`${number}`() === number;
});

await test("true", async () => {
	return await e`true`() === true;
});

await test("false", async () => {
	return await e`false`() === false;
});

await test("int", async () => {
	return await e`1`() === 1n;
});

await test("float", async () => {
	return await e`1.23`() === 1.23;
});

await test("string", async () => {
	return await e`"foo"`() === "foo";
});

await test("addition", async () => {
	return await e`1 + 2 - 4 + 8`() === 7n;
});

await test("multiplication", async () => {
	return await e`1 * 2 / 4 * 8`() === 4n;
});

await test("long addition", async () => {
	const opening_balance = e`1000`;
	const sales = e`500`;
	const expenses = e`200`;

	const closing_balance = e`
	  + ${opening_balance}
	  + ${sales} 
	  - ${expenses}
	`;

	return await closing_balance() === 1300n;
});

await test("long multiplication", async () => {
	const gravitational_constant = e`0.67`;
	const mass_a = e`10.0`;
	const mass_b = e`5.0`;
	const distance = e`100.0`;

	const force = e`
	  * ${gravitational_constant}
	  * ${mass_a}
	  * ${mass_b}
	  / ${Math.pow(await distance(), 2)}
	`;

	return (await force()).toFixed(5) === "0.00335";
});

await test("logical or 1", async () => {
	return await e`
	  || false
	  || false
	  || false
	`() === false;
});

await test("logical or 2", async () => {
	return await e`
	  || false
	  || true
	  || false
	`() === true;
});

await test("logical and 1", async () => {
	return await e`
	  && false
	  && true
	  && false
	`() === false;
});

await test("logical and 2", async () => {
	return await e`
	  && true
	  && true
	  && true
	`() === true;
});

await test("bare enum", async () => {
	const foo = await e`:foo`();
	return is_enm(foo) && foo.sym === "foo";
});

await test("nested bare enum", async () => {
	const foo = await e`:foo:bar`();
	return is_enm(foo) && foo.sym === "foo" && is_enm(foo.data) && foo.data.sym === "bar";
});
