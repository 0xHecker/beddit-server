"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Post_1 = require("../entities/Post");
const Updoot_1 = require("../entities/Updoot");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "beddit2",
    synchronize: true,
    logging: true,
    entities: [Post_1.Post, User_1.User, Updoot_1.Updoot],
    migrations: [path_1.default.join(__dirname, "../migrations/*")],
});
exports.default = AppDataSource;
//# sourceMappingURL=appDataSource.js.map