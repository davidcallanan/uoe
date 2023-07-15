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
// Use JavaScript when other operations are needed.

// RULES

const expression = declare();

const atom = declare();

atom.define(or(
	mapData(join(NOT, atom), data => () => !data[1]()),
	mapData(FLOAT, data => () => data),
	mapData(INT, data => () => data),
	mapData(CONSTANT, data => (ctx) => ctx.constants[data]),
	mapData(join(LPAREN, expression, RPAREN), data => () => data[1]()),
));

expression.define(
	atom,
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

