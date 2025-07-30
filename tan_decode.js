import { error_user_payload } from "./error_user_payload.js";
import { throw_error } from "./throw_error.js";

const unprefix = (lines, num_chars) => {
	return lines.map((line) => line.substring(num_chars));
};

export const _tan_decode = (lines, format_uint8array) => {
	const entries = [];

	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (line === "") {
			i++;
		} else if (line.startsWith(">> ")) {
			const nested_lines = [];

			for (let j = i; (true
				&& j < lines.length
				&& lines[j].startsWith(">> ")
			); j++) {
				nested_lines.push(lines[j]);
			}

			entries.push(_tan_decode(unprefix(nested_lines, 3), format_uint8array));

			i = j;
		} else if (line.startsWith("> ")) {
			const nested_lines = [];

			for (let j = i; (true
				&& j < lines.length
				&& lines[j].startsWith("> ")
			); j++) {
				nested_lines.push(lines[j]);
			}

			entries.push(unprefix(nested_lines, 2).join("\n"));

			i = j;
		} else {
			entries.push(line);
			i++;
		}
	}

	if (format_uint8array) {
		return entries.map((entry) => {
			if (typeof entry === "string") {
				return new TextEncoder().encode(entry);
			}

			return entry;
		});
	}

	return entries;
};

/**
 * @stabililty 1 - experimental
 *
 * Decodes a string in "Textual Array Notation" back into an array of strings or nested arrays.
 * 
 * You can choose to set options.format to "uint8array" if you prefer this format over strings. The default format is "string".
 * 
 * TODO: I learned today that utf8 cannot store arbitrary binary data. I had understood my whole life that the rendering engine would render "corrupt" characters, but I figured that the raw data would still be used internally in text editors etc. It seems I was wrong, and I am thus forced to implement a custom encoding mechanism.
 */
export const tan_decode = (input, options) => {
	options ??= {};
	options.format ??= "string";

	if (typeof input !== "string") {
		throw_error(error_user_payload("input must be string"));
	}

	const lines = input.split("\n");
	return _tan_decode(lines, options.format === "uint8array");
};

export const tanDecode = tan_decode;
