import {
	Resolver,
	Mutation,
	Arg,
	Field,
	Ctx,
	ObjectType,
	Query,
	FieldResolver,
	Root,
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

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		// it is okay to show the current user their email
		if (req.session.userId === user._id) {
			return user.email;
		}
		return "";
	}
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Arg("confirmNewPassword") confirmNewPassword: string,
		@Ctx() { redis, req }: MyContext
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
		if (newPassword !== confirmNewPassword) {
			return {
				errors: [
					{
						field: "confirmNewPassword",
						message: "password fields do not match",
					},
				],
			};
		}
		const key = FORGET_PASSWORD_PREFIX + token;

		const userIdstr: string | null = await redis.get(key);
		if (!userIdstr) {
			return {
				errors: [
					{
						field: "token",
						message: "token expired",
					},
				],
			};
		}

		const userId = parseInt(userIdstr);
		const user = await User.findOne({ where: { _id: userId } });
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

		await User.update(
			{ _id: userId },
			{ password: await argon2.hash(newPassword) }
		);

		await redis.del(key);
		// login after change password
		req.session.userId = user._id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { redis }: MyContext
	) {
		const user = await User.findOne({ where: { email } });
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
	async me(@Ctx() { req }: MyContext) {
		if (!req.session.userId) {
			return null;
		}
		return await User.findOne({ where: { _id: req.session.userId } });
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);
		let user;
		try {
			const result = await User.create({
				username: options.username,
				password: hashedPassword,
				email: options.email,
			}).save();
			user = result as any;
		} catch (err) {
			if (err.detail.includes("email")) {
				return {
					errors: [
						{
							field: "email",
							message: "that email is already used",
						},
					],
				};
			}
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
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes("@")
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
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
