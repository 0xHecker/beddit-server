import { UsernamePasswordInput } from "../resolvers/UsernamePasswordImport";

const validateEmail = (email: string) => {
	var re =
		/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	return re.test(email);
};

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length < 3) {
		return [
			{
				field: "username",
				message: "username length should bre greater than 2",
			},
		];
	}

	if (options.password.length < 3) {
		return [
			{
				field: "password",
				message: "password length should be greater than 2",
			},
		];
	}

	if (options.username.includes("@")) {
		return [
			{
				field: "username",
				message: "username cannot contain symbol @",
			},
		];
	}

	if (!validateEmail(options.email)) {
		return [
			{
				field: "email",
				message: "invalid email",
			},
		];
	}

	return null;
};
