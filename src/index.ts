import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello-resolver';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from 'src/types';
import AppDataSource from './utils/appDataSource';
import cors from 'cors';

require('dotenv').config();
// import { sendEmail } from './utils/sendEmail';
import { createUserLoader } from './utils/createUserLoader';

const app = express();

const main = async () => {
	// sendEmail('bob@bob.com', 'hello there');

	await AppDataSource.initialize();

	await AppDataSource.runMigrations();

	const RedisStore = connectRedis(session);

	const redis = new Redis(process.env.REDIS_URL);

	app.set('trust proxy', 1);

	app.use(
		cors({
			origin: [
				process.env.CORS_ORIGIN,
				'http://localhost:3000',
				'https://beddit.shanmukh.xyz',
				'https://shanmukh.xyz',
				'https://beddit-lac.vercel.app',
			],
			credentials: true,
		})
	);

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
				sameSite: 'none', //'lax', // csrf
				secure: true, //__prod__ // cookie only works in https
				// domain: "",
			},
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET,
			resave: false,
		})
	);

	// const httpServer = http.createServer(app);
	// const plugins = [ApolloServerPluginDrainHttpServer({ httpServer })];
	// plugins.push(ApolloServerPluginLandingPageLocalDefault());

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [
				HelloResolver,
				PostResolver,
				UserResolver,
			],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
		}),
		// plugins: plugins,
		// plugins: [
		//     ApolloServerPluginLandingPageGraphQLPlayground(),
		// ],
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	app.get('/', (_, res) => {
		res.send('heloo');
	});
	const PORT: string = process.env.PORT;
	app.listen(PORT, () => {
		console.log(`server started on localhost:${PORT}`);
	});
};

main().catch((err) => {
	console.log(err);
});
