import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import * as dotenv from "dotenv"
import { User } from './entities/User'
import { Account } from './entities/Account'
import { Transaction } from './entities/Transaction'
import { Contact } from './entities/Contact'
import { Session } from './entities/Session'

dotenv.config()

const options: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    logging: false,
    entities: [User, Account, Transaction, Contact, Session],
    migrations: [],
    subscribers: [],
}

export const AppDataSource = new DataSource(options)
