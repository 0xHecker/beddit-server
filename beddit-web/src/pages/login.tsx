import React from "react";
import { Form, Formik } from "formik";
import { Button, Box } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import CreateUrqlClient from "../utils/CreateUrqlClient";

const Login: React.FC<{}> = () => {
	const router = useRouter();
	const [, login] = useLoginMutation();
	return (
		<>
			<NavBar />
			<Wrapper varient="small">
				<Formik
					initialValues={{ usernameOrEmail: "", password: "" }}
					onSubmit={async (values, { setErrors }) => {
						const response = await login(values);
						console.log(response);

						if (response.data?.login.errors) {
							setErrors(toErrorMap(response.data.login.errors));
						} else if (response.data?.login.user) {
							// worked
							router.push("/");
						}
					}}
				>
					{({ isSubmitting }) => (
						<Form>
							<InputField
								name="usernameOrEmail"
								placeholder="username or email"
								label="username or email"
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
								Login
							</Button>
						</Form>
					)}
				</Formik>
			</Wrapper>
		</>
	);
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Login);
