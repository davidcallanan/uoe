/**
 * Converts a uoe-error into a JavaScript error and throws it.
 */
export const throw_error = (body) => {
	throw (() => {
		if (body.error_type === "user_error") {
			const message =
	`error_type       ${body.error_type}
	error_message    ${body.error_message}
	http_status_code ${body.http_status_code}
	`;
			let err = new Error(message, { cause: body });
			err.name = "UserError";
			return err;
		} else if (body.error_type === "state_error") {
			const message =
	`error_type       ${body.error_type}
	error_name       ${body.error_name}
	error_message    ${body.error_message}
	http_status_code ${body.http_status_code}
	`;
			let err = new Error(message, { cause: body });
			err.name = "StateError";
			return err;
		} else if (body.error_type === "internal_error") {
			const message =
	`error_type       ${body.error_type}
	error_message    ${body.error_message}
	http_status_code ${body.http_status_code}
	`;
			let err = new Error(message, { cause: body });
			err.name = "InternalError";
			return err;
		}
	})();
};
