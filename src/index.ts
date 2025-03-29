import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express, { Application } from 'express'
import swaggerUi from 'swagger-ui-express'
import corsMiddleware from './middlewares/cors.middleware'
import { errorHandler, invalidPathHandler } from './middlewares/error.middleware'
import loggerMidleware from './middlewares/logger.middleware'
import { analysisRoutes } from './routes/analysis.routes'
import { swaggerDocs } from './utils/swaggerConfig'
import { authRoutes } from './routes/auth.routes'
import { accountRoutes } from './routes/account.routes'
import { testRoute } from './routes/test.routes'

dotenv.config()

const app: Application = express()

app.use(loggerMidleware)
app.use(express.json())
app.use(cookieParser())
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(corsMiddleware)

app.use('/api', analysisRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/my', accountRoutes)
app.use('/api', testRoute)

app.use(invalidPathHandler)

app.use(errorHandler)

export default app
