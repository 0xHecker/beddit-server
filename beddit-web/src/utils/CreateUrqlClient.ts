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
} from "../generated/graphql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";

import { pipe, tap } from "wonka";

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
		console.log(allFields);

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

		// const visited = new Set();
		// let result: NullArray<string> = [];
		// let prevOffset: number | null = null;

		// for (let i = 0; i < size; i++) {
		// 	const { fieldKey, arguments: args } = fieldInfos[i];
		// 	if (args === null || !compareArgs(fieldArgs, args)) {
		// 		continue;
		// 	}

		// 	const links = cache.resolve(entityKey, fieldKey) as string[];
		// 	const currentOffset = args[cursorArgument];

		// 	if (
		// 		links === null ||
		// 		links.length === 0 ||
		// 		typeof currentOffset !== "number"
		// 	) {
		// 		continue;
		// 	}

		// 	const tempResult: NullArray<string> = [];

		// 	for (let j = 0; j < links.length; j++) {
		// 		const link = links[j];
		// 		if (visited.has(link)) continue;
		// 		tempResult.push(link);
		// 		visited.add(link);
		// 	}

		// 	if (
		// 		(!prevOffset || currentOffset > prevOffset) ===
		// 		(mergeMode === "after")
		// 	) {
		// 		result = [...result, ...tempResult];
		// 	} else {
		// 		result = [...tempResult, ...result];
		// 	}

		// 	prevOffset = currentOffset;
		// }

		// const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
		// if (hasCurrentPage) {
		// 	return result;
		// } else if (!(info as any).store.schema) {
		// 	return undefined;
		// } else {
		// 	info.partial = true;
		// 	return result;
		// }
	};
};

const CreateUrqlClient = (ssrExchange: any) => ({
	url: "http://localhost:4000/graphql",
	fetchOptions: { credentials: "include" } as const,
	suspense: true,
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
					createPost: (_result, args, cache, info) => {
						const allFields = cache.inspectFields("Query");
						const fieldInfos = allFields.filter(
							(info) => info.fieldName === "posts"
						);
						fieldInfos.forEach((fi) => {
							cache.invalidate("Query", "posts", fi.arguments);
						});
						cache.invalidate("Query", "posts", {
							limit: 15,
						});
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
});

export default CreateUrqlClient;
