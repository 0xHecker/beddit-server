import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

type InputFieldProps = {
	label: string;
	placeholder: string;
	name: string;
	type?: string;
	textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
	label,
	type,
	textarea,
	placeholder,
	...props
}) => {
	const [field, { error }] = useField(props);
	let InputOtTextarea: any = Input;
	if (textarea) {
		InputOtTextarea = Textarea;
	}
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel fontWeight={"bold"} htmlFor={field.name}>
				{label}
			</FormLabel>
			<InputOtTextarea
				{...field}
				type={type}
				id={field.name}
				placeholder={placeholder}
			/>
			{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
		</FormControl>
	);
};
