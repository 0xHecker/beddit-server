import React from "react";
import { Form, Formik } from "formik";
import { Button, Box } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";

interface registerProps {}

const REGISTER_MUT = `
	mutation Register(
    $username: String!,
    $password: String!
  ) {
  register(options: {
    username: $username,
    password: $password
  }) {
    errors {
      field
      message
    }
    user {
      _id
      createdAt
      updatedAt
      username
    }
  }
}
`;

const Register: React.FC<registerProps> = () => {
	const [, register] = useRegisterMutation();
	return (
		<Wrapper varient="small">
			<Formik
				initialValues={{ username: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await register(values);
					if (response.data?.register.errors) {
						setErrors({ username: response.data?.register.errors[0].message });
					}
					return response.data?.register?.user?._id;
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="username"
							placeholder="username"
							label="Username"
							type="text"
						/>

						<Box mt={4}>
							<InputField
								name="password"
								placeholder="password"
								label="Password"
								type="password"
							/>
						</Box>

						<Button
							mt={4}
							colorScheme="teal"
							isLoading={isSubmitting}
							type="submit"
						>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Register;
