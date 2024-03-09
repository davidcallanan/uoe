import { leaf_map } from "../leaf_map.js";

// Bug: The following does not work correctly.
// const x = expr`(:foo -> :bar("hello"))`;
// console.log("j", await (await x.foo()).data[0]());
// console.log("w", await (await x.foo().data)[0]());

import { mapData, join, opt, multi, opt_multi, or, declare } from "./blurp.js";

import { tup } from "../tup.js";

// TOKENS

const SPACE = /^\s+/;
const SINGLELINE_COMMENT  = mapData(/^\s*\/\/(.*?)\n/s,   data => data.groups[0]);
const MULTILINE_COMMENT   = mapData(/^\s*\/\*(.*?)\*\//s, data => data.groups[0]);
const SKIPPERS = opt(multi(or(SPACE, SINGLELINE_COMMENT, MULTILINE_COMMENT)));

const withSkippers = (p) => mapData(join(SKIPPERS, p, SKIPPERS), data => data[1]);

const INT = withSkippers(mapData(/^\d+/, data => BigInt(data.groups.all)));
const FLOAT = withSkippers(mapData(/^\d+\.\d+/, data => parseFloat(data.groups.all)));
const STRING = withSkippers(mapData(/^\"(.*?)\"/, data => data.groups[0]));
const BARE_CONSTANT = mapData(/^\:\!CONSTANT\$[0-9]\!+/, data => data.groups.all.split("$")[1].split("!")[0]);
const CONSTANT = withSkippers(BARE_CONSTANT);
const BARE_SYMBOL = mapData(/^\:[a-z_][a-z0-9_]*/, data => data.groups.all.substring(1));
const SYMBOL = withSkippers(BARE_SYMBOL);
const PLUS = withSkippers("+");
const MINUS = withSkippers("-");
const MULT = withSkippers("*");
const DIV = withSkippers("/");
const AND = withSkippers("&&");
const OR = withSkippers("||");
const EQ = withSkippers("==");
const NEQ = withSkippers("!=");
const LT = withSkippers("<");
const GT = withSkippers(">");
const LTE = withSkippers("<=");
const GTE = withSkippers(">=");
const NOT = withSkippers("!");
const LPAREN = withSkippers("(");
const RPAREN = withSkippers(")");
const TRUE = withSkippers("true");
const FALSE = withSkippers("false");
const COMMA = withSkippers(",");
const SEMI = withSkippers(";");
const RARR = withSkippers("->");
// Use JavaScript when other operations are needed.

// RULES

const symbol_extension = declare();
const atom = declare();
const crystal = declare();
const pistol = declare();
const expression = declare();

symbol_extension.define(
	or(
		mapData(
			join(SYMBOL, opt(symbol_extension)),
			data => (ctx) => ({
				sym: data[0],
				...data[1] && {
					data: data[1](ctx),
				},
			}),
		),
		mapData(atom, data => (ctx) => data(ctx)),
	),
);

const symbol = mapData(
	join(BARE_SYMBOL, opt(symbol_extension)),
	data => (ctx) => ({
		sym: data[0],
		...data[1] && {
			data: data[1](ctx),
		},
	}),
);

const constant = mapData(
	CONSTANT,
	data => (ctx) => leaf_map(ctx.constants[data]),
);

const constant_call = mapData(
	join(constant, opt_multi(atom)),
	data => (ctx) => {
		let result = data[0](ctx);

		for (let i = 0; i < data[1].length; i++) {
			result = result(data[1][i](ctx));
		}

		return result;
	},
);

const tuple_entry = or(
	mapData(
		join(SYMBOL, RARR, expression),
		data => ({
			type: "mapping_entry",
			symbol: data[0],
			expression: data[2],
		}),
	),
	mapData(
		expression,
		data => ({
			type: "positional_entry",
			expression: data,
		}),
	),
);

const tuple = mapData(
	or(
		mapData(
			join(LPAREN, opt_multi(join(tuple_entry, SEMI)), RPAREN),
			data => ({
				entries: data[1].map(entry => entry[0]),
			}),
		),
		mapData(
			join(LPAREN, opt_multi(tuple_entry, COMMA), RPAREN),
			data => ({
				entries: data[1],
			}),
		),
	),
	data => (ctx) => {
		let positional_entries = [];
		let named_entries = {};

		// TODO: nested syntactic sugar.

		let i = 0;

		for (let entry of data.entries) {
			if (entry.type == "positional_entry") {
				positional_entries.push(entry.expression(ctx));
			} else if (entry.type == "mapping_entry") {
				named_entries[entry.symbol] = entry.expression(ctx);
			}
		}

		return tup(...positional_entries)(named_entries);
	},
);

atom.define(or(
	mapData(join(NOT, atom), data => (ctx) => leaf_map((async () => {
		return !await data[1](ctx)();
	})())),
	mapData(FLOAT, data => () => leaf_map(data)),
	mapData(INT, data => () => leaf_map(data)),
	mapData(STRING, data => () => leaf_map(data)),
	constant_call,
	symbol,
	mapData(TRUE, () => () => leaf_map(true)),
	mapData(FALSE, () => () => leaf_map(false)),
	tuple,
));

pistol.define(or(
	mapData(join(atom, multi(join(or(PLUS, MINUS), atom))), data => (ctx) => leaf_map((async () => {
		let result = await data[0](ctx)();

		for (let i = 0; i < data[1].length; i++) {
			const op = data[1][i][0];
			const value = await data[1][i][1](ctx)();

			if (op == "+") {
				result += value;
			} else if (op == "-") {
				result -= value;
			}
		}

		return result;
	})())),
	mapData(join(atom, multi(join(or(MULT, DIV), atom))), data => (ctx) => leaf_map((async () => {
		let result = await data[0](ctx)();
		let is_bigint = typeof result === "bigint";
		const outstanding = [];

		for (let i = 0; i < data[1].length; i++) {
			const op = data[1][i][0];
			const value = await data[1][i][1](ctx)();

			if (op == "*") {
				result *= value;
			} else if (op == "/") {
				if (is_bigint) {
					outstanding.push(value);
				} else {
					result /= value;
				}
			}
		}

		if (is_bigint) {
			for (let i = 0; i < outstanding.length; i++) {
				result /= outstanding[i];
			}
		}

		return result;
	})())),
	mapData(join(atom, multi(join(AND, atom))), data => (ctx) => leaf_map((async () => {
		let result = await data[0](ctx)();

		for (let i = 0; i < data[1].length; i++) {
			result = result && await data[1][i][1](ctx)();
		}

		return result;
	})())),
	mapData(join(atom, multi(join(OR, atom))), data => (ctx) => leaf_map((async () => {
		let result = await data[0](ctx)();

		for (let i = 0; i < data[1].length; i++) {
			result = result || await data[1][i][1](ctx)();
		}

		return result;
	})())),
	mapData(join(atom, multi(join(or(EQ, NEQ, GTE, LTE, GT, LT), atom))), data => (ctx) => leaf_map((async () => {
		let prev_value = await data[0](ctx)();

		for (let i = 0; i < data[1].length; i++) {
			const op = data[1][i][0];
			const value = await data[1][i][1](ctx)();

			if (op == "==") {
				if (!(prev_value === value)) {
					return false;
				}
			} else if (op == "!=") {
				if (!(prev_value !== value)) {
					return false;
				}
			} else if (op == ">") {
				if (!(prev_value > value)) {
					return false;
				}
			} else if (op == "<") {
				if (!(prev_value < value)) {
					return false;
				}
			} else if (op == ">=") {
				if (!(prev_value >= value)) {
					return false;
				}
			} else if (op == "<=") {
				if (!(prev_value <= value)) {
					return false;
				}
			}

			prev_value = value;
		}

		return true;
	})())),
	atom,
));

crystal.define(or(
	mapData(multi(join(or(PLUS, MINUS), atom)), data => (ctx) => leaf_map((async () => {
		let result;
		
		for (let i = 0; i < data.length; i++) {
			const op = data[i][0];
			const value = await data[i][1](ctx)();

			if (i == 0) {
				if (typeof value === "number") {
					result = 0;
				} else {
					result = 0n;
				}
			}
			
			if (op === "+") {
				result += value;
			} else if (op === "-") {
				result -= value;
			}
		}

		return result;
	})())),
	mapData(multi(join(or(MULT, DIV), atom)), data => (ctx) => leaf_map((async () => {
		let result;
		let is_bigint = false;
		const outstanding = [];
		
		for (let i = 0; i < data.length; i++) {
			const op = data[i][0];
			const value = await data[i][1](ctx)();

			if (i == 0) {
				if (typeof value === "number") {
					result = 1;
				} else {
					result = 1n;
					is_bigint = true;
				}
			}
			
			if (op === "*") {
				result *= value;
			} else if (op === "/") {
				if (is_bigint) {
					outstanding.push(value);
				} else {
					result /= value;
				}
			}
		}

		if (is_bigint) {
			for (let i = 0; i < outstanding.length; i++) {
				result /= outstanding[i];
			}
		}

		return result;
	})())),
	mapData(multi(join(AND, atom)), data => (ctx) => leaf_map((async () => {
		let result = true;
		
		for (let i = 0; i < data.length; i++) {
			const value = await data[i][1](ctx)();
			result &&= value;
		}

		return result;
	})())),
	mapData(multi(join(OR, atom)), data => (ctx) => leaf_map((async () => {
		let result = false;
		
		for (let i = 0; i < data.length; i++) {
			const value = await data[i][1](ctx)();
			result ||= value;
		}

		return result;
	})())),
	pistol,
));

expression.define(
	withSkippers(crystal),
);

const cache = new Map();

const run_expr = (input, constants) => {
	const ctx = {
		constants,
	};

	if (cache.has(input)) {
		const result = cache.get(input);
		return result.data(ctx);
	}
	
	const result = expression(input);
	
	if (result.success === false || result.input !== "") {
		console.error(result);
		throw `Failed to parse`;
	}

	cache.set(input, result);
	
	return result.data(ctx);
};

/**
 * Evaluates an expression.
 * 
 * @example
 * 
 * await e("1 + 2")(); // 3
 * 
 * @example
 * 
 * const closing_balance = await e`
 *   + ${opening_balance}
 *   + ${sales}
 *   - ${expenses}
 * `();
 * 
 * @example
 * 
 * const F = await e`
 *   * ${gravitational_constant}
 *   * ${mass_a}
 *   * ${mass_b}
 *   / ${Math.pow(distance, 2)}
 * `();
 * 
 * @example
 * 
 * if (await e`
 *   && ${is_eligible}
 *   && (
 *     || ${is_of_age}
 *     || ${has_parental_consent}
 *   )
 * `()) {}
 * 
 * @example
 * 
 * const person = e`{
 *   :first_name "John";
 *   :last_name "Doe";
 *   :age 27;
 * }`;
 */
export const e = (arg, ...expressions) => {
	if (Array.isArray(arg)) {
		// This is a tagged template literal.

		let input = "";

		for (let [i, segment] of arg.entries()) {
			input += segment;

			if (i < expressions.length) {
				input += `:!CONSTANT\$${i}!`;
			}
		}

		const constants = expressions;
		return run_expr(input, constants);
	}

	const input = arg;
	return run_expr(input, []);
};
