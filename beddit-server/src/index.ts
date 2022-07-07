import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from './constants';
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from "./resolvers/hello-resolver";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user_res";

const main = async () => {
    const orm = await MikroORM.init(microConfig);
    // await orm.getMigrator().up();

    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    
    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver,PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });

    await apolloServer.start()

    apolloServer.applyMiddleware({app});

    app.get("/", (_,res) => {
        res.send("heloo")
    })

    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })

    // const post = orm.em.fork({}).create(Post, {title: "my third post"});
    // await orm.em.persistAndFlush(post); 
    // const posts = await orm.em.fork({}).find(Post, {})
    // console.log(posts)
};

main().catch((err) => {
    console.log(err)
});