import cors from 'cors'
import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import { invalidPathHandler } from './middlewares/error.middleware'
import { analysisRoutes } from './routes/cttAnalysis.routes'
import { uploadRoutes } from './routes/upload.routes'
import logger from './utils/logger'
import morgan from 'morgan'

dotenv.config()

const app: Application = express()
const port = process.env.PORT || 3000

const allowedOrigins = ['https://lifeistoolong.id.vn', 'https://www.lifeistoolong.id.vn']

const morganFormat = ':method :url :status :response-time ms'

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        }
        logger.info(JSON.stringify(logObject))
      },
    },
  })
)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: false,
  })
)

app.use('/api', uploadRoutes)
app.use('/api', analysisRoutes)

app.use(invalidPathHandler)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
