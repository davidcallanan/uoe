/**
 * Constructs a larger map from a list of patterns and their corresponding maps.
 * 
 * @example
 * 
 * const default_map = leaf_map("foobar");
 * 
 * const map = pattern_map([
 *   default_map,
 * 	 ["foo", leaf_map("foo")],
 *   ["bar", leaf_map("bar")],
 * ]);
 * 
 * await map(); // "foobar"
 * await map("foo")(); // "foo"
 * await map("bar")(); // "bar"
 * 
 * @todo Implement more patterns than just a simple symbol match.
 */
export const pattern_map = () => {
	throw "Not implemented";
};
