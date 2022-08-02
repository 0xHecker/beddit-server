import path from "path";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "postgres",
	password: "postgres",
	database: "beddit2",
	synchronize: true,
	logging: true,
	entities: [Post, User, Updoot],
	migrations: [path.join(__dirname, "../migrations/*")],
});

export default AppDataSource;
