// src/index.ts
import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { uploadRoutes } from './routes/upload.routes'
import { analysisRoutes } from './routes/cttAnalysis.routes'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: 'http://127.0.0.1:5173',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
)

app.use('/api', uploadRoutes)
app.use('/api', analysisRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
