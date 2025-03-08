import dotenv from 'dotenv'
import express, { Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import corsMiddleware from './middlewares/cors.middleware'
import { errorHandler, invalidPathHandler } from './middlewares/error.middleware'
import loggerMidleware from './middlewares/logger.middleware'
import { analysisRoutes } from './routes/analysis.routes'
import { swaggerDocs } from './utils/swaggerConfig'
import { authRoutes } from './routes/auth.route'
import { accountRoutes } from './routes/account.route'

dotenv.config()

const app: Application = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(loggerMidleware)
app.use(corsMiddleware)

app.use('/api', analysisRoutes)
app.use('/api/auth', authRoutes)
app.use('/api', accountRoutes)

app.use(invalidPathHandler)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
