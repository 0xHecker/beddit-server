import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useMeQuery, useCreatePostMutation } from "../generated/graphql";

export const useIsAuth = () => {
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();
	const [, createPost] = useCreatePostMutation();

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (!fetching && !data?.me) {
			router.replace("/login");
		}
	}, [data, router, fetching]);
};
