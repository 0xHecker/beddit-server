import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

type UpdootSectionProps = {
	post: PostSnippetFragment;
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();
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
						setLoadingState("updoot-loading");
						await vote({
							postId: post._id,
							value: 1,
						});
						setLoadingState("not-loading");
					}}
					key={post._id}
					isLoading={loadingState === "updoot-loading"}
					aria-label="updoot post"
					icon={<ChevronUpIcon w="24px" h="24px" />}
				/>

				{post.points}

				<IconButton
					onClick={async () => {
						setLoadingState("downdoot-loading");

						vote({
							postId: post._id,
							value: -1,
						});
						setLoadingState("not-loading");
					}}
					isLoading={loadingState === "downdoot-loading"}
					aria-label="downdoot post"
					icon={<ChevronDownIcon w="24px" h="24px" />}
				/>
			</Flex>

			<Box mt={2} key={post._id}>
				<Heading fontSize="xl">{post.title}</Heading>
				posted by <b>{post.creator.username}</b>{" "}
				<Text mt={4}>{post.textSnippet}</Text>
			</Box>
		</Flex>
	);
};

export default UpdootSection;
