import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import {
	PostSnippetFragment,
	useDeletePostMutation,
	useMeQuery,
	useVoteMutation,
} from "../generated/graphql";
import NextLink from "next/link";
import router from "next/router";
type UpdootSectionProps = {
	post: PostSnippetFragment;
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();

	const [{ data: userData, fetching: userFetching }] = useMeQuery();

	const [, deletePost] = useDeletePostMutation();

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
				posted by <b>{post.creator.username}</b>{" "}
				<Flex align={"center"}>
					<Text flex={1} mt={4}>
						{post.textSnippet}
					</Text>
					<Box>
						{userData ? (
							userData?.me?._id === post.creatorId ? (
								<IconButton
									onClick={async () => {
										deletePost({ deletePostId: post._id });
									}}
									ml={"auto"}
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
					</Box>
				</Flex>
			</Box>
		</Flex>
	);
};

export default UpdootSection;
