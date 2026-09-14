import "reflect-metadata"
import { DataSource, DataSourceOptions } from "typeorm"
import * as dotenv from "dotenv"
import { User } from './entities/User'
import { Account } from './entities/Account'
import { Transaction } from './entities/Transaction'
import { Contact } from './entities/Contact'
import { Session } from './entities/Session'
import { RoomCode } from './entities/RoomCode'

dotenv.config()

const entities = [User, Account, Transaction, Contact, Session, RoomCode]

const options: DataSourceOptions = process.env.DATABASE_URL
    ? {
        type: "postgres",
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        synchronize: true,
        logging: false,
        entities,
        migrations: [],
        subscribers: [],
    }
    : {
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        synchronize: true,
        logging: false,
        entities,
        migrations: [],
        subscribers: [],
    }

export const AppDataSource = new DataSource(options)
