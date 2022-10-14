"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_resolver_1 = require("./resolvers/hello-resolver");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const appDataSource_1 = __importDefault(require("./utils/appDataSource"));
require('dotenv').config();
const createUserLoader_1 = require("./utils/createUserLoader");
const app = (0, express_1.default)();
const main = async () => {
    await appDataSource_1.default.initialize();
    await appDataSource_1.default.runMigrations();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = ioredis_1.default.createClient();
    app.set('trust proxy', 1);
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [
                hello_resolver_1.HelloResolver,
                post_1.PostResolver,
                user_1.UserResolver,
            ],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: (0, createUserLoader_1.createUserLoader)(),
        }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.get('/', (_, res) => {
        res.send('heloo');
    });
    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`server started on localhost:${PORT}`);
    });
};
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map