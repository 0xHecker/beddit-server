import router from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromURl = () => {
	let intId =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	return usePostQuery({
		variables: {
			postId: intId,
		},
	});
};
