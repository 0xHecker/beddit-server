import {
	Resolver,
	Query,
	Arg,
	Mutation,
	InputType,
	Field,
	Ctx,
	UseMiddleware,
	Int,
	FieldResolver,
	Root,
	ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "../types";
import isAuth from "../middleware/isAuth";
import { Updoot } from "../entities/Updoot";
import AppDataSource from "../utils/appDataSource";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const { userId } = req.session;
		const updoot = await Updoot.findOne({ where: { postId, userId } });
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;

		// the user has voted on the post before
		// and they are changing their vote
		if (updoot && updoot.value !== realValue) {
			await AppDataSource.transaction(async (tm) => {
				await tm.query(
					`
					update updoot
					set value = $1
					where "postId" = $2 and "userId" = $3
					`,
					[realValue, postId, userId]
				);

				await tm.query(
					`
					update post
					set points = points + $1
					where _id = $2
				`,
					[realValue * 2, postId]
				);
			});
		} else if (!updoot) {
			// has never voted before
			AppDataSource.transaction(async (tm) => {
				await tm.query(
					`
					insert into updoot ("userId", "postId", value)
					values ($1, $2, $3)
					`,
					[userId, postId, realValue]
				);

				await tm.query(
					`
					update post
					set points = points + $1
					where _id = $2
				`,
					[realValue, postId]
				);
			});
		}

		return true;
	}
	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
		@Ctx() { req }: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = Math.min(50, limit) + 1;

		const replacements: any[] = [realLimitPlusOne];
		if (req.session.userId) {
			replacements.push(req.session.userId);
		}

		let cursorIdx = 3;

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
			cursorIdx = replacements.length;
		}

		const posts = await Post.getRepository().query(
			`
			select p.*, 
			json_build_object(
				'_id',u._id,
				'username', u.username,
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt"
				) creator,
				${
					req.session.userId
						? '(select value from updoot where "userId" = $2 and "postId" = p._id) "voteStatus"'
						: 'null as "voteStatus"'
				}
			from post p
			inner join public.user u on u._id = p."creatorId"
			${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
			order by p."createdAt" DESC
			limit $1
			`,
			replacements
		);

		// const qb = Post.getRepository()
		// 	.createQueryBuilder("p")
		// 	.innerJoinAndSelect("p.creator", "u", 'u._id = p."creatorId"')
		// 	.orderBy('p."createdAt"', "DESC")
		// 	.take(realLimitPlusOne);

		// if (cursor) {
		// 	qb.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor)),
		// 	});
		// }

		// const posts = await qb.getMany();

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post)
	async post(@Arg("id", () => Int) _id: number): Promise<Post | null> {
		let p = await Post.findOne({ where: { _id }, relations: ["creator"] });
		console.log(p);

		return p;
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return await Post.create({
			...input,
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("_id") _id: number,
		@Arg("title") title: string,
		@Arg("text") text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await Post.getRepository()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('_id = :_id and "creatorId" = :creatorId', {
				_id,
				creatorId: req.session.userId,
			})
			.returning("*")
			.execute();

		return result.raw[0];
		// return await Post.update(
		// 	{ _id, creatorId: req.session.userId },
		// 	{ title, text }
		// );
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) _id: number,
		@Ctx() { req }: MyContext
	): Promise<Boolean> {
		// const post = await Post.findOne({ where: { _id } });
		// if (!post) {
		// 	return false;
		// }
		// if (post.creatorId !== req.session.userId) {
		// 	throw new Error("not authorized");
		// }
		await Post.delete({ _id, creatorId: req.session.userId });

		return true;
	}
}
