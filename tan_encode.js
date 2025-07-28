import { error_user_payload } from "./error_user_payload.js";

const prefix = (string, pref) => {
	return string
		.split("\n")
		.map((line) => pref + line)
		.join("\n");
};

const is_dangerous = (entry) => (false
	|| entry === ""
	|| entry.includes("\n")
	|| entry.startsWith(">")
);

/**
 * @stabililty 1 - experimental
 * 
 * Encodes an (optionally nested) array of strings into "Textual Array Notation".
 * 
 * Can handle strings or uint8arrays containing arbitrary textual or binary data, including newlines.
 */
export const tan_encode = (entries) => {
	if (!Array.isArray(entries)) {
		throw error_user_payload("entries must be array");
	}

	let output = "";
	let prev_was = undefined;

	const mapped_entries = entries.map((entry) => {
		if (entry instanceof Uint8Array) {
			return new TextDecoder().decode(entry);
		}

		return entry;
	});

	for (const entry of mapped_entries) {
		if (typeof entry === "string") {
			if (is_dangerous(entry)) {
				if (prev_was === "multiline_string") {
					output += "\n";
				}
				output += prefix(entry, "> ") + "\n";
				prev_was = "multiline_string";
			} else {
				output += entry + "\n";
				prev_was = "string";
			}
		} else if (Array.isArray(entry)) {
			const itself = tan_encode(entry);

			if (prev_was === "multiline_tan") {
				output += "\n";
			}

			output += prefix(itself, ">> ") + "\n";
			prev_was = "multiline_tan";
		} else {
			throw error_user_payload("each entry must be string, uint8array or array");
		}
	}

	return output;
};

export const tanEncode = tan_encode;
