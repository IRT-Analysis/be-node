import FormData from 'form-data'
import { Request, Response } from 'express'
import dotenv from 'dotenv'
import axios from 'axios'
import { AppError } from '@/controllers/analysis.controller'
import { handleError } from '@/middlewares/error.middleware'

dotenv.config()

interface FlaskResponse {
  code: number
  message: string
  data: unknown
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate uploaded file
    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    // Prepare form data
    const formData = new FormData()
    formData.append('file', req.file.buffer as Buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    // Send file to Flask API
    const { data } = await axios.post<FlaskResponse>(`${process.env.FLASK_API_ENDPOINT}/ctt`, formData, {
      headers: { ...formData.getHeaders() },
    })

    res.status(data.code).json(data)
  } catch (error: unknown) {
    handleError(res, error)
  }
}
