import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from 'path';
import { User } from './entities/User';

export default {
    migrations: {
        path: path.join(__dirname,'./migrations'), // path to the folder with migrations
        // glob: '!(*.d).{js,ts}', // match migration files (all .js and .ts files, but not .d.ts)
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: [Post, User],
    allowGlobalContext: true,
    dbName: 'beddit',
    type: 'postgresql',
    debug: !__prod__,
    user: 'postgres', 
    password: 'postgres'
} as Parameters<typeof MikroORM.init>[0];