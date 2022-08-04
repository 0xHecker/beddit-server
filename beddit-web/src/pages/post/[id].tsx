import { withUrqlClient } from "next-urql";
import React, { useEffect, useState } from "react";
import CreateUrqlClient from "../../utils/CreateUrqlClient";
import { useRouter } from "next/router";
import {
	useDeletePostMutation,
	useMeQuery,
	usePostQuery,
} from "../../generated/graphql";
import Layout from "../../components/Layout";
import { Box, Flex, Heading, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

const Post = ({}) => {
	const router = useRouter();
	let intId =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data, error, fetching }] = usePostQuery({
		variables: {
			postId: intId,
		},
	});
	// const [{ data: userData, fetching: userFetching }] = useMeQuery();

	// const [, deletePost] = useDeletePostMutation();

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);

	if (fetching) {
		return (
			<Layout>
				<div>loading...</div>;
			</Layout>
		);
	}
	if (error) {
		return <div>{error.message}</div>;
	}

	if (!data?.post) {
		return <div>Could not find the post </div>;
	}

	if (!mounted) {
		return <div>Loading...</div>;
	}

	if (!fetching && !data) {
		return <div>you got query failed for some reason</div>;
	}

	if (typeof window === "undefined") {
		return <>Err...</>;
	} else {
		return (
			<Layout>
				<Flex width={700} justify={"space-between"}>
					<Heading mb={4}>{data.post.title}</Heading>
					{/* <Box>
						{userData ? (
							userData?.me?._id === data.post.creatorId ? (
								<IconButton
									onClick={async () => {
										await deletePost({ deletePostId: data?.post._id });
										console.log(router.route);

										router.push("/");
									}}
									colorScheme={"red"}
									aria-label="delete post"
									icon={<DeleteIcon w="20px" h="20px" />}
								/>
							) : (
								""
							)
						) : (
							""
						)}
					</Box> */}
				</Flex>

				{data?.post.text}
			</Layout>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Post);
