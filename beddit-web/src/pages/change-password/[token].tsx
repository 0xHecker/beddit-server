import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useEffect, useState } from "react";
import { withUrqlClient } from "next-urql";
import CreateUrqlClient from "../../utils/CreateUrqlClient";
import NavBar from "../../components/NavBar";
import NextLink from "next/link";

const ChangePassword: NextPage<{ token: string }> = () => {
	const router = useRouter();
	const [, ChangePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState("");
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
			<div>
				<NavBar />
				<Wrapper variant="small">
					<Formik
						initialValues={{ newPassword: "", confirmNewPassword: "" }}
						onSubmit={async (values, { setErrors }) => {
							const response = await ChangePassword({
								newPassword: values.newPassword,
								confirmNewPassword: values.confirmNewPassword,
								token:
									typeof router.query.token === "string"
										? router.query.token
										: "",
							});

							if (response.data?.changePassword.errors) {
								const errorMap = toErrorMap(
									response.data.changePassword.errors
								);
								if ("token" in errorMap) {
									setTokenError(errorMap.token);
								}
								setErrors(errorMap);
							} else if (response.data?.changePassword.user) {
								router.push("/");
							}
							// worked
						}}
					>
						{({ isSubmitting }) => (
							<Form>
								<InputField
									name="newPassword"
									placeholder="new password"
									label="New Password"
									type="password"
								/>
								<br />
								<InputField
									name="confirmNewPassword"
									placeholder="confirm new password"
									label="Confirm New Password"
									type="password"
								/>
								{tokenError ? (
									<Flex>
										<Box mr={4} color={"red"}>
											{tokenError}
										</Box>
										<NextLink href="/forgot-password">
											<Link>click here to het a new one</Link>
										</NextLink>
									</Flex>
								) : null}

								<Button
									mt={4}
									colorScheme="teal"
									isLoading={isSubmitting}
									type="submit"
								>
									change password
								</Button>
							</Form>
						)}
					</Formik>
				</Wrapper>
			</div>
		);
	}
};
/*
{ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string,
	};
};} */

export default withUrqlClient(CreateUrqlClient)(ChangePassword);
