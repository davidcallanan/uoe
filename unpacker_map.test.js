import { api } from "./api.js";
import { test } from "./test.js";
import { unpacker_map } from "./unpacker_map.js";

await test("basic test", async () => {
	const m = unpacker_map(($) => {
		$.$fall((input) => {
			if (input === undefined) {
				return "hello";
			}
			
			return "world";
		});
	});

	return await m() === "hello" && await m.foo() === "world";
});

await test("simple leaf values", async () => {
	const person = unpacker_map(($) => {
		$.name.$ret("John Doe");
		$.age.$ret(27);
		$.friends.$ret(["mary", "jane", "joseph"]);
	});
	
	return (true
		&& await person.name() === "John Doe"
		&& await person.age() === 27
		&& (friends => ["mary", "jane", "joseph"].every(entry => friends.includes(entry)))(await person.friends())
	);
});

await test("nested leaf values", async () => {
	const person = unpacker_map(($) => {
		$.name.$ret("John Doe");
		$.age.$ret(27);
		$.friends.$ret(["mary", "jane", "joseph"]);
		$.address(($) => {
			$.$ret("123 Main St, Monopoly Town, CA");
			$.street.$ret("123 Main St");
			$.city.$ret("Monopoly Town");
			$.state.$ret("CA");
		});
	});
	
	return (true
		&& await person.name() === "John Doe"
		&& await person.age() === 27
		&& (friends => ["mary", "jane", "joseph"].every(entry => friends.includes(entry)))(await person.friends())
		&& await person.address() === "123 Main St, Monopoly Town, CA"
		&& await person.address.street() === "123 Main St"
		&& await person.address.city() === "Monopoly Town"
		&& await person.address.state() === "CA"
	);
});

await test("map calls", async () => {
	const m = unpacker_map(($) => {
		$.greet.$call(async (input) => {
			return `Hello, ${await input.name()}!`;
		});
		
		$.converse.$call(async (input) => {
			return `How are you today, ${await input.name()}?`;
		});
	});
	
	const person = unpacker_map(($) => {
		$.name.$ret("Jim");
	});
	
	return (true
		&& await m.greet(person)() === "Hello, Jim!"
		&& await m.converse(person)() === "How are you today, Jim?"
	);
});

await test("map calls returning maps", async () => {
	const m = unpacker_map(($) => {
		$.greet.$call(async (input) => {
			return unpacker_map(($) => {
				$.option_a.$ret_lazy(async () => `Hello, ${await input.name()}!`);
				$.option_b.$ret_lazy(async () => `Bye, ${await input.name()}!`);
			});
		});
	});
	
	const person = unpacker_map(($) => {
		$.name.$ret("Jim");
	});
	
	return (true
		&& await m.greet(person).option_a() === "Hello, Jim!"
		&& await m.greet(person).option_b() === "Bye, Jim!"
	);
});

await test("map calls returning maps async", async () => {
	const m = unpacker_map(($) => {
		$.greet.$call(async (input) => {
			return unpacker_map(async ($) => {
				$.option_a.$ret(`Hello, ${await input.name()}!`);
				$.option_b.$ret(`Bye, ${await input.name()}!`);
			});
		});
	});
	
	const person = unpacker_map(($) => {
		$.name.$ret("Jim");
	});
	
	return (true
		&& await m.greet(person).option_a() === "Hello, Jim!"
		&& await m.greet(person).option_b() === "Bye, Jim!"
	);
});

await test("api calls", async () => {
	const m = unpacker_map(($) => {
		$.query_foo.$ret(api(async () => {
			return unpacker_map(($) => {
				$.foo.$ret("bar");
			})
		}));
	});
	
	return await m.query_foo().foo() === "bar";
});
