import path from "path";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { DataSource } from "typeorm";
require("dotenv").config();

const AppDataSource = new DataSource({
	type: "postgres",
	port: 5432,
	url: process.env.DATABASE_URL,
	// synchronize: true,
	logging: true,
	entities: [Post, User, Updoot],
	migrations: [path.join(__dirname, "../migrations/*")],
});

export default AppDataSource;
