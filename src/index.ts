import "reflect-metadata"
import express, { Application } from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"
import { AppDataSource } from "./data-source"
import * as dotenv from "dotenv"

dotenv.config()

const app: Application = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const PORT = process.env.PORT || 3000

AppDataSource.initialize().then(async () => {
    console.log("Database connected")
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}).catch(error => console.log(error))

export default app
