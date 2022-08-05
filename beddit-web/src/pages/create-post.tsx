import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { InputField } from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/CreateUrqlClient";

const CreatePost: React.FC<{}> = ({}) => {
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();
	const [, createPost] = useCreatePostMutation();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (!fetching && !data?.me) {
			router.replace("/login?next=" + router.pathname);
		}
	}, [data, router, fetching]);

	if (!mounted) {
		return <div>Loading...</div>;
	}
	if (typeof window === "undefined") {
		return <>Err...</>;
	} else {
		return (
			<Layout variant="small">
				<Formik
					initialValues={{ title: "", text: "" }}
					onSubmit={async (values, { setErrors }) => {
						const { error } = await createPost({ input: values });
						if (!error) {
							router.push("/");
						}
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
								Create Post
							</Button>
						</Form>
					)}
				</Formik>
			</Layout>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(CreatePost);
