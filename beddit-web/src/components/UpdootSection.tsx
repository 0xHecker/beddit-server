import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React, { useState } from "react";
import {
	PostSnippetFragment,
	useMeQuery,
	useVoteMutation,
} from "../generated/graphql";
import { EditDeletePostButton } from "./EditDeletePostButtons";
type UpdootSectionProps = {
	post: PostSnippetFragment;
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();

	const [{ data: userData, fetching: userFetching }] = useMeQuery();

	return (
		<Flex p={5} shadow="md" width="100%" borderWidth="1px">
			<Flex
				direction={"column"}
				alignItems="center"
				justifyContent="center"
				marginRight={6}
			>
				<IconButton
					onClick={async () => {
						if (post.voteStatus === 1) {
							return;
						}

						setLoadingState("updoot-loading");
						await vote({
							postId: post._id,
							value: 1,
						});
						setLoadingState("not-loading");
					}}
					key={post._id}
					colorScheme={post.voteStatus === 1 ? "green" : undefined}
					isLoading={loadingState === "updoot-loading"}
					aria-label="updoot post"
					icon={<ChevronUpIcon w="24px" h="24px" />}
				/>

				{post.points}

				<IconButton
					onClick={async () => {
						if (post.voteStatus === -1) return;
						setLoadingState("downdoot-loading");

						await vote({
							postId: post._id,
							value: -1,
						});
						setLoadingState("not-loading");
					}}
					colorScheme={post.voteStatus === -1 ? "red" : undefined}
					isLoading={loadingState === "downdoot-loading"}
					aria-label="downdoot post"
					icon={<ChevronDownIcon w="24px" h="24px" />}
				/>
			</Flex>
			<Box flex={1}>
				<NextLink href="/post/[id]" as={`/post/${post._id}`}>
					<Link>
						<Heading fontSize="xl">{post.title}</Heading>
					</Link>
				</NextLink>
				posted by <b>{post.creator.username}</b>
				<Flex align={"center"}>
					<Text flex={1} mt={4}>
						{post.textSnippet}
					</Text>

					<EditDeletePostButton id={post._id} creatorId={post.creatorId} />
				</Flex>
			</Box>
		</Flex>
	);
};

export default UpdootSection;
