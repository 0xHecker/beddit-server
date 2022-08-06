import { usePostQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromURl = () => {
	const intId = useGetIntId();
	return usePostQuery({
		pause: intId === -1,
		variables: {
			postId: intId,
		},
	});
};
