export const user_payload_error = (message, cause) => ({
	status: "error",
	error_type: "user_error",
	error_message: `Malformed payload.\n${message}`,
	http_status_code: 400,
	short_code: "up",
	...(cause && {
		cause,
	}),
});

export const userPayloadError = user_payload_error;
