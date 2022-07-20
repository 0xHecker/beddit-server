import { Flex, Button, Box, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { InputField } from "../components/InputField";
import NavBar from "../components/NavBar";
import { Wrapper } from "../components/Wrapper";
import { withUrqlClient } from "next-urql";
import CreateUrqlClient from "../utils/CreateUrqlClient";
import NextLink from "next/link";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
	const [complete, setComplete] = useState(false);
	const [, forgotPassword] = useForgotPasswordMutation();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div>Loading...</div>;
	}
	if (typeof window === "undefined") {
		return <>Err...</>;
	} else {
		return (
			<>
				<NavBar />
				<Wrapper variant="small">
					<Formik
						initialValues={{ email: "", password: "" }}
						onSubmit={async (values) => {
							await forgotPassword(values);
							setComplete(true);
						}}
					>
						{({ isSubmitting }) =>
							complete ? (
								<Box color={"green"}>
									if that account with that username exists, we sent you an
									email
								</Box>
							) : (
								<Form>
									<Box mt={4}>
										<InputField
											name="email"
											placeholder="email"
											label="email"
											type="email"
										/>
									</Box>

									<Flex>
										<NextLink href="/login">
											<Link ml={"auto"}>login instead?</Link>
										</NextLink>
									</Flex>

									<Button
										mt={4}
										colorScheme="teal"
										isLoading={isSubmitting}
										type="submit"
									>
										Submit
									</Button>
								</Form>
							)
						}
					</Formik>
				</Wrapper>
			</>
		);
	}
};

export default withUrqlClient(CreateUrqlClient)(ForgotPassword);
