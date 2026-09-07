import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import * as dotenv from "dotenv"

dotenv.config()

const options: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
}

export const AppDataSource = new DataSource(options)
