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
} from "type-graphql";
import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import isAuth from "../middleware/isAuth";
import { User } from "../entities/User";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}
@Resolver()
export class PostResolver {
	@Query(() => [Post])
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<Post[]> {
		const realLimit = Math.min(50, limit);
		const posts = Post.getRepository()
			.createQueryBuilder("user")
			.orderBy('"createdAt"', "DESC")
			.take(realLimit);

		if (cursor) {
			posts.where('"createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor)),
			});
		}

		return posts.getMany();
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
