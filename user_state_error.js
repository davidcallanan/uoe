export const user_state_error = (message, cause) => ({
	status: "error",
	error_type: "user_error",
	error_message: `User-inferable state error.\nThis request is illegal in the implied state.\n${message}`,
	http_status_code: 403,
	short_code: "us",
	...(cause && {
		cause,
	}),
});

export const userStateError = user_state_error;
