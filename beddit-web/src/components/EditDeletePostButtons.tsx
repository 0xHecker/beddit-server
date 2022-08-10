import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonProps {
	id: number;
	creatorId: number;
}

export const EditDeletePostButton: React.FC<EditDeletePostButtonProps> = ({
	id,
	creatorId,
}) => {
	const [, deletePost] = useDeletePostMutation();
	const [{ data: userData, fetching: userFetching }] = useMeQuery();

	if (userData?.me?._id !== creatorId) {
		return null;
	}

	return (
		<Box>
			<NextLink href={"/post/edit/[id]"} as={`/post/edit/${id}`}>
				<IconButton
					ml={"auto"}
					mr={4}
					variant={"unstyled"}
					colorScheme={"facebook"}
					aria-label="update post"
					icon={<EditIcon w="20px" h="20px" />}
				/>
			</NextLink>

			<IconButton
				onClick={async () => {
					deletePost({ deletePostId: id });
				}}
				ml={"auto"}
				variant={"unstyled"}
				colorScheme={"facebook"}
				aria-label="delete post"
				icon={<DeleteIcon w="20px" h="20px" />}
			/>
		</Box>
	);
};
