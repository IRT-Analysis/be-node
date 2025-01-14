import { analysisRoutes } from '@/routes/cttAnalysis.routes'
import request from 'supertest'
import express from 'express'
import dotenv from 'dotenv'

// Load environment variables

interface AnalyzedItemResponse {
  message: string
  data: Record<string, unknown>
  code: number
}

interface GeneralDetailResponse {
  message: string
  data: Record<string, unknown>
  code: number
}

dotenv.config()

const app = express()
app.use(express.json())
app.use('/api', analysisRoutes)

describe('Analysis API Routes', () => {
  describe('GET /api/ctt/items/:id', () => {
    it('should return analyzed item by ID', async () => {
      const mockId = '123'

      // Perform the request (calls actual Flask API)
      const response = await request(app).get(`/api/ctt/items/${mockId}`)
      const body = response.body as AnalyzedItemResponse
      expect(response.status).toBe(200)
      expect(body).toHaveProperty('message', `Analysis ${mockId} results retrieved successfully.`)
      expect(body).toHaveProperty('data')
      expect(body.data).toHaveProperty('C1')
      expect(body.data.C1).toHaveProperty('difficulty')
      expect(body.data.C1).toHaveProperty('difficulty_category')
      expect(body.data.C1).toHaveProperty('discrimination')
      expect(body.data.C1).toHaveProperty('discrimination_category')
      expect(body.data.C1).toHaveProperty('r_pbis')
      expect(body.data.C1).toHaveProperty('options')
    })
  })

  describe('GET /api/ctt/general-detail/:id', () => {
    it('should return general details by ID', async () => {
      const mockId = '456'

      // Perform the request (calls actual Flask API)
      const response = await request(app).get(`/api/ctt/general-detail/${mockId}`)
      const body = response.body as GeneralDetailResponse

      expect(response.status).toBe(200)
      expect(body).toHaveProperty('message', `Analysis ${mockId} general detail retrieved successfully.`)
      expect(body).toHaveProperty('data')
      expect(body.data).toHaveProperty('general')
      expect(body.data).toHaveProperty('histogram')
      expect(body.data).toHaveProperty('average')
    })
  })
})
