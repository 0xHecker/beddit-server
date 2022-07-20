import { withUrqlClient } from "next-urql";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/CreateUrqlClient";
import Layout from "../components/Layout";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

const Index = () => {
	const [result] = usePostsQuery({
		variables: {
			limit: 3,
		},
	});
	let { data, fetching } = result;

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, [fetching]);

	if (!mounted) {
		return <div>Loading...</div>;
	}
	if (typeof window === "undefined") {
		return <>Err...</>;
	} else {
		return (
			<Layout>
				<NextLink href={"/create-post"}>
					<Link>Create Post</Link>
				</NextLink>
				<div>Home</div>
				<div>
					{!data ? (
						<div> Loading!... </div>
					) : (
						data.posts.map((p) => {
							return <div key={p._id}>{p.title}</div>;
						})
					)}
				</div>
			</Layout>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Index);
