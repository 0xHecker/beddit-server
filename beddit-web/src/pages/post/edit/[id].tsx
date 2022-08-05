import React from "react";
import { withUrqlClient } from "next-urql";
import CreateUrqlClient from "../../../utils/CreateUrqlClient";
import { useRouter } from "next/router";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";

const EditPost: React.FC<{}> = () => {
	const router = useRouter();

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values, { setErrors }) => {}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="title"
							placeholder="title"
							label="Title"
							type="text"
						/>

						<Box mt={4}>
							<InputField
								name="text"
								placeholder="text..."
								label="Body"
								textarea={true}
							/>
						</Box>

						<Button
							mt={4}
							colorScheme="teal"
							isLoading={isSubmitting}
							type="submit"
						>
							Edit Post no.{router.query.id}
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(CreateUrqlClient)(EditPost);
