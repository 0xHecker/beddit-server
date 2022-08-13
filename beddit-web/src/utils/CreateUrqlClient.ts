import {
	dedupExchange,
	Exchange,
	fetchExchange,
	stringifyVariables,
} from "urql";
import {
	LoginMutation,
	MeQuery,
	MeDocument,
	RegisterMutation,
	LogoutMutation,
	VoteMutationVariables,
	DeletePostMutationVariables,
} from "../generated/graphql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import { gql } from "@urql/core";

import { pipe, tap } from "wonka";
import { isServer } from "./isServer";

const errrorExchange: Exchange =
	({ forward }) =>
	(ops$: any) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error?.message.includes("not authenticated")) {
					Router.replace("/login");
				}
			})
		);
	};

const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;

		const allFields = cache.inspectFields(entityKey);

		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			"posts"
		);
		info.partial = !isItInTheCache;

		let hasMore: boolean = true;
		const results: string[] = [];

		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, "posts") as string[];
			const _hasMore = cache.resolve(key, "hasMore") as boolean;
			if (!_hasMore) {
				hasMore = _hasMore;
			}
			results.push(...data);
		});

		let obj = {
			__typename: "PaginatedPosts",
			hasMore,
			posts: results,
		};

		// console.log("thing returned: ", obj);

		return obj;
	};
};

function invalidateAllPosts(cache: Cache) {
	const allFields = cache.inspectFields("Query");
	const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
	fieldInfos.forEach((fi) => {
		cache.invalidate("Query", "posts", fi.arguments);
	});
	cache.invalidate("Query", "posts", {
		limit: 15,
	});
}

const CreateUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = "";
	if (isServer()) {
		cookie = ctx?.req?.headers?.cookie;
	}
	return {
		url: process.env.NEXT_PUBLIC_API_URL as string,
		fetchOptions: {
			credentials: "include" as const,
			headers: cookie
				? {
						cookie,
				  }
				: undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: { PaginatedPosts: () => null },
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (_result, args, cache, info) => {
							cache.invalidate({
								__typename: "Post",
								// @ts-ignore
								_id: (args as DeletePostMutationVariables).id,
							});
						},
						vote: (_result, args, cache, _info) => {
							const { value, postId } = args as VoteMutationVariables;

							const data = cache.readFragment(
								gql`
									fragment _ on Post {
										_id
										points
										voteStatus
									}
								`,
								{ _id: postId }
							);

							if (data) {
								if (data.voteStatus === value) {
									return;
								}
								const newPoints =
									(data.points as number) + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment __ on Post {
											points
											voteStatus
										}
									`,
									{ _id: postId, points: newPoints, voteStatus: value } as any
								);
							}
						},

						createPost: (_result, args, cache, info) => {
							invalidateAllPosts(cache);
						},

						login: (_result, args, cache, info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.login.errors) {
										return query;
									} else {
										return {
											me: result.login.user,
										};
									}
								}
							);
							invalidateAllPosts(cache);
						},

						register: (_result, args, cache, info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.register.errors) {
										return query;
									} else {
										return {
											me: result.register.user,
										};
									}
								}
							);
						},

						logout: (_result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								() => ({ me: null })
							);
						},
					},
				},
			}),
			errrorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};

export default CreateUrqlClient;
