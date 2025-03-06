import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import { authMiddleware } from './middlewares/auth.middleware'
import corsMiddleware from './middlewares/cors.middleware'
import { invalidPathHandler } from './middlewares/error.middleware'
import loggerMidleware from './middlewares/logger.middleware'
import { analysisRoutes } from './routes/cttAnalysis.routes'
import { uploadRoutes } from './routes/upload.routes'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocs } from './utils/swaggerConfig'

dotenv.config()

const app: Application = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(loggerMidleware)
app.use(corsMiddleware)

app.use('/api', authMiddleware, uploadRoutes)
app.use('/api', analysisRoutes)
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.use(invalidPathHandler)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
