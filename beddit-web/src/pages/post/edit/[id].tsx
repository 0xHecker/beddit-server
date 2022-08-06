import React from "react";
import { withUrqlClient } from "next-urql";
import CreateUrqlClient from "../../../utils/CreateUrqlClient";
import {  useRouter } from "next/router";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { useGetPostFromURl } from "../../../utils/useGetPostFromUrl";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";

const EditPost: React.FC<{}> = () => {
	const router = useRouter();
	const intId = useGetIntId();
	const [{ data, fetching }] = useGetPostFromURl();
	const [, updatePost] = useUpdatePostMutation();

	if (fetching) {
		return (
			<Layout>
				<div>loading...</div>
			</Layout>
		);
	}

	if (!data?.post) {
		return (
			<Layout>
				<div>Couldn't find the post</div>
			</Layout>
		);
	}

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: data?.post.title, text: data?.post.text }}
				onSubmit={async (values) => {
					await updatePost({
						id: intId,
						...values,
					});
					router.push("/");
				}}
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
