import { withUrqlClient } from "next-urql";
import { useState, useEffect } from "react";
import { usePostsQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/CreateUrqlClient";
import Layout from "../components/Layout";
import { Button, Flex, Stack } from "@chakra-ui/react";
import UpdootSection from "../components/UpdootSection";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
	});

	const [{ data, fetching, ...other }] = usePostsQuery({
		variables,
	});

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

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
				<div>
					{!data && fetching ? (
						<div> Loading!... </div>
					) : (
						<Stack spacing={8} direction="column">
							{data ? (
								data!.posts.posts.map((p) =>
									!p ? null : (
										<Flex key={p._id} p={5} shadow="md" borderWidth={"1px"}>
											<UpdootSection post={p} key={p._id} />
										</Flex>
									)
								)
							) : (
								<div>Loading...</div>
							)}
						</Stack>
					)}
				</div>
				{data?.posts.hasMore ? (
					<Flex>
						<Button
							onClick={() =>
								setVariables({
									limit: variables.limit,
									cursor:
										data.posts.posts[data.posts.posts.length - 1].createdAt,
								})
							}
							isLoading={fetching}
							m="auto"
							my={8}
						>
							load more
						</Button>
					</Flex>
				) : null}
			</Layout>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Index);
