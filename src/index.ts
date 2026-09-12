import express, { Application } from "express"
import cookieParser from "cookie-parser"
import logger from "morgan"

const app: Application = express()

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get("/health", (_req, res) => {
    res.json({ message: "API is running" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app
