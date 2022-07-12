import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello-resolver";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import * as redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "src/types";
// import {
//     ApolloServerPluginLandingPageGraphQLPlayground
//   } from "apollo-server-core";

const app = express();
const main = async () => {
	const orm = await MikroORM.init(microConfig);
	// await orm.getMigrator().up();

	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redisClient,
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

	const generator = orm.getSchemaGenerator();
	await generator.updateSchema();

	// const httpServer = http.createServer(app);
	// const plugins = [ApolloServerPluginDrainHttpServer({ httpServer })];
	// plugins.push(ApolloServerPluginLandingPageLocalDefault());

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
		// plugins: plugins,
		// plugins: [
		//     ApolloServerPluginLandingPageGraphQLPlayground(),
		// ],
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({
		app,
		cors: {
			origin: ["https://studio.apollographql.com", "http://localhost:3000"],
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
