import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello-resolver";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "src/types";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { sendEmail } from "./utils/sendEmail";
import path from "path";
// import {
// import { User } from './entities/User';
// ApolloServerPluginLandingPageGraphQLPlayground
//   } from "apollo-server-core";

const app = express();

const main = async () => {
	// sendEmail("bob@bob.com", "hello there");

	const AppDataSource = new DataSource({
		type: "postgres",
		host: "localhost",
		port: 5432,
		username: "postgres",
		password: "postgres",
		database: "beddit2",
		synchronize: true,
		logging: true,
		entities: [Post, User],
		migrations: [path.join(__dirname, "./migrations/*")],
	});

	await AppDataSource.initialize();

	await AppDataSource.runMigrations();

	const RedisStore = connectRedis(session);
	const redis = Redis.createClient();

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
				httpOnly: true,
				sameSite: "none", //'lax', // csrf
				secure: true, //__prod__ // cookie only works in https
			},
			saveUninitialized: false,
			secret: "fw4y7duiehofjkjgnejuicydsc",
			resave: false,
		})
	);

	// const httpServer = http.createServer(app);
	// const plugins = [ApolloServerPluginDrainHttpServer({ httpServer })];
	// plugins.push(ApolloServerPluginLandingPageLocalDefault());

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ req, res, redis }),
		// plugins: plugins,
		// plugins: [
		//     ApolloServerPluginLandingPageGraphQLPlayground(),
		// ],
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({
		app,
		cors: {
			origin: [
				"https://studio.apollographql.com",
				"http://localhost:3000",
				"http://localhost:4000",
			],
			credentials: true,
		},
	});
	app.set("trust proxy", 1);

	app.get("/", (_, res) => {
		res.send("heloo");
	});

	app.listen(4000, () => {
		console.log("server started on localhost:4000");
	});

	// await new Promise<void>(resolve =>
	//     httpServer.listen({ port: 4000}, resolve)
	// );

	// const post = orm.em.fork({}).create(Post, {title: "my third post"});
	// await orm.em.persistAndFlush(post);
	// const posts = await orm.em.fork({}).find(Post, {})
	// console.log(posts)
};

main().catch((err) => {
	console.log(err);
});
