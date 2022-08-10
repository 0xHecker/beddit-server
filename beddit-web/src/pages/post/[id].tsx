import { withUrqlClient } from "next-urql";
import { useEffect, useState } from "react";
import CreateUrqlClient from "../../utils/CreateUrqlClient";

import { Box, Flex, Heading } from "@chakra-ui/react";
import { EditDeletePostButton } from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import { useMeQuery } from "../../generated/graphql";
import { useGetPostFromURl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
	const [{ data, error, fetching }] = useGetPostFromURl();
	const [{ data: userData, fetching: userFetching }] = useMeQuery();

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
					<Box>
						<EditDeletePostButton
							id={data.post._id}
							creatorId={data.post.creatorId}
						/>
					</Box>
				</Flex>

				{data?.post.text}
			</Layout>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Post);
