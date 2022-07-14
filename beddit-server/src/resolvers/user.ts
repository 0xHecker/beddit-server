import {
	Resolver,
	Mutation,
	Arg,
	Field,
	Ctx,
	ObjectType,
	Query,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordImport";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
	@Field(() => String)
	field: string;
	@Field(() => String)
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];
	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { redis, em, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length < 3) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "password length must be greater than 2",
					},
				],
			};
		}
		const key = FORGET_PASSWORD_PREFIX + token;

		const userId = await redis.get(key);
		if (!userId) {
			return {
				errors: [
					{
						field: "token",
						message: "token expired",
					},
				],
			};
		}

		const user = await em.findOne(User, { _id: parseInt(userId) });
		if (!user) {
			return {
				errors: [
					{
						field: "token",
						message: "User no longer exists",
					},
				],
			};
		}
		user.password = await argon2.hash(newPassword);
		em.persistAndFlush(user);

		await redis.del(key);
		// login after change password
		req.session.userId = user._id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { em, redis }: MyContext
	) {
		const user = await em.findOne(User, { email });
		if (!user) {
			// the email is not in the db

			return true;
		}

		const token = v4();
		const key = FORGET_PASSWORD_PREFIX + token;

		await redis.set(key, user._id, "EX", 1000 * 60 * 60 * 3);
		await sendEmail(
			email,
			`<a href="http://localhost:3000/change-password/${token}"> reset password </a>`
		);
		return true;
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { req, em }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		const user = em.findOne(User, { _id: req.session.userId });

		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);
		const user = em.create(User, {
			username: options.username,
			password: hashedPassword,
			email: options.email,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		try {
			await em.persistAndFlush(user);
		} catch (err) {
			if (err.code === "23505" || err.detail.includes("already exists")) {
				return {
					errors: [
						{
							field: "username",
							message: "username already taken",
						},
					],
				};
			}
		}

		req.headers["x-forwarded-proto"] = "https";

		req.session!.userId = user._id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(
			User,
			usernameOrEmail.includes("@")
				? { email: usernameOrEmail }
				: { username: usernameOrEmail }
		);
		if (!user) {
			return {
				errors: [
					{
						field: "usernameOrEmail",
						message: "that username does not exist",
					},
				],
			};
		}

		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			};
		}
		// required inorder to store userId cache
		req.headers["x-forwarded-proto"] = "https";

		req.session!.userId = user._id;

		return { user };
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) => {
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					console.log(err);
					resolve(false);
				}

				resolve(true);
			});
		});
	}
}
