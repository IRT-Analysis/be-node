import { invalidPathHandler } from './middlewares/error.middleware'
// src/index.ts
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import { analysisRoutes } from './routes/cttAnalysis.routes'
import { uploadRoutes } from './routes/upload.routes'

dotenv.config()

const app: Application = express()
const port = process.env.PORT || 3000

const allowedOrigins = ['https://lifeistoolong.id.vn', 'https://www.lifeistoolong.id.vn']

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
