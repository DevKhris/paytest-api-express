import express, { Application } from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import contactRoutes from "./routes/contact.routes"
import { requestLogger } from "./middleware/requestLogger.middleware"
import { errorHandler } from "./middleware/error.middleware"

const app: Application = express()

app.use(cors())
app.use(requestLogger)
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/health", (_req, res) => {
    res.json({ message: "API is running" })
})

app.use("/contacts", contactRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
