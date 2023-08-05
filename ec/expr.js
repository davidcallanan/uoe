import { mapData, join, opt, multi, opt_multi, or, declare } from "./blurp.js";

// TOKENS

const SPACE = /^\s+/;
const SINGLELINE_COMMENT  = mapData(/^\s*\/\/(.*?)\n/s,   data => data.groups[0]);
const MULTILINE_COMMENT   = mapData(/^\s*\/\*(.*?)\*\//s, data => data.groups[0]);
const SKIPPERS = opt(multi(or(SPACE, SINGLELINE_COMMENT, MULTILINE_COMMENT)));

const withSkippers = (p) => mapData(join(SKIPPERS, p, SKIPPERS), data => data[1]);

const INT = withSkippers(mapData(/^\d+/, data => BigInt(data.groups.all)));
const FLOAT = withSkippers(mapData(/^\d+\.\d+/, data => parseFloat(data.groups.all)));
const CONSTANT = withSkippers(mapData(/^\:\!CONSTANT\$[0-9]+/, data => data.groups.all.split("$")[1]));
const PLUS = withSkippers("+");
const MINUS = withSkippers("-");
const MULT = withSkippers("*");
const DIV = withSkippers("/");
const AND = withSkippers("&&");
const OR = withSkippers("||");
const NOT = withSkippers("!");
const LPAREN = withSkippers("(");
const RPAREN = withSkippers(")");
const TRUE = withSkippers("true");
const FALSE = withSkippers("false");
// Use JavaScript when other operations are needed.

// RULES

const atom = declare();
const crystal = declare();
const expression = declare();

atom.define(or(
	mapData(join(NOT, atom), data => () => !data[1]()),
	mapData(FLOAT, data => () => data),
	mapData(INT, data => () => data),
	mapData(CONSTANT, data => (ctx) => ctx.constants[data]),
	mapData(TRUE, data => () => true),
	mapData(FALSE, data => () => false),
	mapData(join(LPAREN, expression, RPAREN), data => () => data[1]()),
));

crystal.define(or(
	mapData(multi(join(or(PLUS, MINUS), atom)), data => (ctx) => {
		let result;
		
		for (let i = 0; i < data.length; i++) {
			const op = data[i][0];
			const value = data[i][1]();

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
	}),
	mapData(multi(join(or(MULT, DIV), atom)), data => (ctx) => {
		let result;
		
		for (let i = 0; i < data.length; i++) {
			const op = data[i][0];
			const value = data[i][1]();

			if (i == 0) {
				if (typeof value === "number") {
					result = 1;
				} else {
					result = 1n;
				}
			}
			
			if (op === "*") {
				result *= value;
			} else if (op === "/") {
				result /= value;
			}
		}

		return result;
	}),
	mapData(multi(join(AND, atom)), data => (ctx) => {
		let result = true;
		
		for (let i = 0; i < data.length; i++) {
			const value = data[i][1]();
			result &&= value;
		}

		return result;
	}),
	mapData(multi(join(OR, atom)), data => (ctx) => {
		let result = false;
		
		for (let i = 0; i < data.length; i++) {
			const value = data[i][1]();
			result ||= value;
		}

		return result;
	}),
	atom,
));

expression.define(
	crystal,
);

const run_expr = (input, constants) => {
	const ctx = {
		constants,
	};
		
	const result = expression(input);
	
	if (result.success === false || result.input !== "") {
		console.error(result);
		throw `Failed to parse expr`;
	}
	
	return result.data(ctx);
};

/**
 * Evaluates a numerical or logical expression.
 * 
 * @example
 * 
 * // Not implemented.
 * exp("1 + 2"); // 3
 * 
 * @example
 * 
 * const new_balance = exp`
 *   + ${initial_balance}
 *   + ${sales}
 *   - ${expenses}
 * `;
 * 
 * @example
 * 
 * const F = exp`
 *   * ${gravitational_constant}
 *   * ${mass_a}
 *   * ${mass_b}
 *   / ${Math.pow(distance, 2)}
 * `;
 * 
 * @example
 * 
 * if (exp`
 *   && ${is_eligible}
 *   && (
 *     || ${is_of_age}
 *     || ${has_parental_consent}
 *   )
 * `) {}
 */
export const expr = (arg, ...expressions) => {
	if (Array.isArray(arg)) {
		// This is a tagged template literal.

		throw "TODO";
	}

	const input = arg;
	return run_expr(input, []);
};

