import request from 'supertest'
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import { analysisRoutes } from '@/routes/cttAnalysis.routes'

dotenv.config()

const app = express()
app.use(express.json())
app.use('/api', analysisRoutes)

describe('POST /api/ctt/analyze - Upload File for Analysis', () => {
  // it('should return an error if the CTT analysis is not initialized', async () => {
  //   const mockId = '123'

  //   const response = await request(app).get(`/api/ctt/general-detail/${mockId}`)
  //   expect(response.status).toBe(500)
  //   expect(response.body).toEqual({
  //     message: 'An unexpected error occurred',
  //     error: 'CTT analysis not initialized.',
  //     code: 500,
  //   })
  // })

  it('should successfully upload a file and process it', async () => {
    const response = await request(app)
      .post('/api/ctt/analyze')
      .attach('file', path.resolve(__dirname, './fixtures/mock_result.xlsx')) // Ensure this file exists and is valid

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('message', 'File uploaded and processed successfully.')
    expect(response.body).toHaveProperty('data')
    expect(response.body).toHaveProperty('code', 201)
  })

  it('should return an error for invalid file types', async () => {
    const response = await request(app)
      .post('/api/ctt/analyze')
      .attach('file', path.resolve(__dirname, './fixtures/mock_unsupport.docx')) // Ensure this file exists and is invalid

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Invalid file type. Only Excel files are allowed.')
    expect(response.body).toHaveProperty('code', 400)
  })

  it('should return an error when no file is uploaded', async () => {
    const response = await request(app).post('/api/ctt/analyze')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: 'No file uploaded',
      code: 400,
      error: null,
    })
  })
})
