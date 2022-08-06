import { withUrqlClient } from "next-urql";
import React, { useEffect, useState } from "react";
import CreateUrqlClient from "../../utils/CreateUrqlClient";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useGetPostFromURl } from "../../utils/useGetPostFromUrl";
import { Flex, Heading } from "@chakra-ui/react";

const Post = ({}) => {
	const router = useRouter();

	const [{ data, error, fetching }] = useGetPostFromURl();

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
		return (
			<Layout>
				<div>Couldn't find the post</div>
			</Layout>
		);
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
