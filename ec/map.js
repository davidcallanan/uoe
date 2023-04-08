import { mapData, join, opt, multi, opt_multi, or, declare } from "./blurp.js";
import { map as uly_map } from "../map.js";

// TOKENS

const SPACE = /^\s+/;
const SINGLELINE_COMMENT  = mapData(/^\s*\/\/(.*?)\n/s,   data => data.groups[0]);
const MULTILINE_COMMENT   = mapData(/^\s*\/\*(.*?)\*\//s, data => data.groups[0]);
const SKIPPERS = opt(multi(or(SPACE, SINGLELINE_COMMENT, MULTILINE_COMMENT)));

const withSkippers = (p) => mapData(join(SKIPPERS, p, SKIPPERS), data => data[1]);
const withLeftSkippers = (p) => mapData(join(SKIPPERS, p), data => data[1]);
const withRightSkippers = (p) => mapData(join(p, SKIPPERS), data => data[0]);

const SEMI = withSkippers(";");
const STRING = withSkippers(mapData(/^\"(.*?)\"/, data => data.groups[0]));
const INT = withSkippers(mapData(/^\d+/, data => BigInt(data.groups.all)));
const CONSTANT = withSkippers(mapData(/^\:\!CONSTANT\$[0-9]+/, data => data.groups.all.split("$")[1]));
const SYMBOL = withSkippers(mapData(/^\:[a-z_][a-z0-9_]*/, data => data.groups.all.substring(1)));
const BARE_SYMBOL = mapData(/^\:[a-z_][a-z0-9_]*/, data => data.groups.all.substring(1));
const LBRACE = withSkippers("{");
const RBRACE = withSkippers("}");

// RULES

const full_map = declare();

const symbol_extension = declare();

symbol_extension.define(mapData(
	join(BARE_SYMBOL, opt(symbol_extension)),
	data => (ctx) => ({
		sym: data[0],
		...data[1] && {
			data: data[1](ctx),
		},
	}),
));

const symbol = mapData(
	join(BARE_SYMBOL, opt(symbol_extension)),
	data => (ctx) => ({
		sym: data[0],
		...data[1] && {
			data: data[1](ctx),
		},
	}),
);

const expression = mapData(
	or(
		mapData(STRING, data => () => data),
		mapData(INT, data => () => data),
		mapData(CONSTANT, data => (ctx) => ctx.constants[data]),
		symbol,
		mapData(full_map, data => (ctx) => create_map_from_node(data, ctx)),
	),
	data => ({
		type: "expression",
		expression: data,
	}),
);

const symbol_mapping = mapData(
	join(SYMBOL, expression, SEMI),
	data => ({
		type: "symbol_mapping",
		symbol: data[0],
		value: data[1],
	}),
);

const statement = mapData(
	or(symbol_mapping),
	data => ({
		type: "statement",
		statement: data,
	}),
);

const map_inner = mapData(
	opt_multi(statement),
	data => ({
		type: "struct_map",
		statements: data,
	}),
);

full_map.define(mapData(
	join(LBRACE, map_inner, RBRACE),
	data => data[1],
));

const create_map_from_node = (result, ctx) => {
	const mapping = new Map();

	for (const { statement } of result.statements) {
		if (statement.type === "symbol_mapping") {
			if (mapping.get(statement.symbol) !== undefined) {
				throw `TODO: merge symbol mappings ${statement.symbol}`;
			} else {
				mapping.set(statement.symbol, statement.value.expression);
			}
		}
	}

	return uly_map((inp) => {
		if (inp === undefined) {
			return undefined;
		}

		const entry = mapping.get(inp.sym);

		if (entry !== undefined) {
			return entry(ctx);
		}

		return undefined;
	});
}

const create_map = (input, constants) => {
	const ctx = {
		constants,
	};
	
	const result = map_inner(input);

	if (result.success === false || result.input !== "") {
		console.error(result);
		throw `Failed to parse map`;
	}

	return create_map_from_node(result.data, ctx);
};

/**
 * Extends the map function with ec language syntax.
 * 
 * @example
 * 
 * const person = map(`
 *   :name "david";
 *   :age 20;
 *   :personality :awesome;
 * `);
 * 
 * console.log(await person.name);
 * console.log(await person.age);
 * console.log(await person.personality);
*/
export const map = (arg, ...expressions) => {
	if (Array.isArray(arg)) {
		// This is a tagged template literal.

		let input = "";

		for (const [i, segment] of arg.entries()) {
			input += segment;

			if (i < expressions.length) {
				input += `:!CONSTANT\$${i}`;
			}
		}

		const constants = expressions;
		return create_map(input, constants);
	}

	if (typeof arg === "string") {
		const input = arg;
		return create_map(input, []);
	}

	return uly_map(arg);
};
