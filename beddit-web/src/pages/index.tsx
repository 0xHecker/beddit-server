import { withUrqlClient } from "next-urql";
import { useState, useEffect } from "react";
import { usePostsQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/CreateUrqlClient";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { Button, Flex, Heading, Link, others, Stack } from "@chakra-ui/react";
import Feature from "../components/Feature";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 33,
		cursor: null as null | string,
	});

	console.log(variables);

	const [{ data, fetching, ...other }] = usePostsQuery({
		variables,
	});

	console.log(data, fetching, other);

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
				<Flex align={"center"} mb={10}>
					<Heading>Beddit</Heading>
					<NextLink href={"/create-post"}>
						<Link fontWeight={700} color={"red.700"} ml={"auto"}>
							Create Post
						</Link>
					</NextLink>
				</Flex>
				<div>
					{!data && fetching ? (
						<div> Loading!... </div>
					) : (
						<Stack spacing={8} direction="column">
							{data ? (
								data.posts.posts.map((p) => {
									return (
										<Feature key={p._id} title={p.title} desc={p.textSnippet} />
									);
								})
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
