import { withUrqlClient } from "next-urql";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/CreateUrqlClient";

const Index = () => {
	const [result] = usePostsQuery();
	let { data, fetching, error } = result;

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div>Loading 1...</div>;
	}
	if (typeof window === "undefined") {
		return <>Err...</>;
	} else {
		return (
			<div>
				<NavBar />
				<div>hello world home</div>
				<div>
					{!data ? (
						<div> Loading!... </div>
					) : (
						data.posts.map((p) => {
							return <div key={p._id}>{p.title}</div>;
						})
					)}
				</div>
			</div>
		);
	}
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Index);
