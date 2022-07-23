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
import { MyContext } from "src/types";
import isAuth from "../middleware/isAuth";

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

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = Math.min(50, limit) + 1;

		const replacements: any[] = [realLimitPlusOne];
		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
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
				) creator
			from post p
			inner join public.user u on u._id = p."creatorId"
			${cursor ? `where p."createdAt" < $2` : ""}
			order by p."createdAt" DESC
			limit $1
			`,
			replacements
		);

		console.log(posts);

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

	@Query(() => Post, { nullable: true })
	post(@Arg("id") _id: number): Promise<Post | null> {
		return Post.findOne({ where: { _id } });
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post)
	async updatePost(
		@Arg("id") _id: number,
		@Arg("title", () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post = await Post.findOne({ where: { _id } });
		if (!post) {
			return null;
		}
		if (typeof title !== "undefined") {
			await Post.update({ _id }, { title });
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") _id: number): Promise<Boolean> {
		await Post.delete({ _id });
		return true;
	}
}
