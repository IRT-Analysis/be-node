import FormData from 'form-data'
import { Request, Response } from 'express'
import dotenv from 'dotenv'
import { handleError } from '@/middlewares/error.middleware'
import { AppError } from './analysis.controller'
import httpClient from '@/utils/httpClient'

dotenv.config()

interface FlaskResponse {
  code: number
  message: string
  data: unknown
}

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate and access files
    const requiredFiles = ['result_file', 'exam_file']
    const files = req.files as { [key: string]: Express.Multer.File[] }

    for (const fileKey of requiredFiles) {
      if (!files[fileKey] || files[fileKey].length === 0) {
        throw new AppError(`Missing file: ${fileKey}`, 400)
      }
    }

    // Prepare form data
    const formData = new FormData()
    for (const fileKey of requiredFiles) {
      const file = files[fileKey][0] // Access the first file for each key
      formData.append(fileKey, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })
    }

    // Send files to Flask API
    const { data } = await httpClient.post<FlaskResponse>(`/ctt`, formData, {
      headers: { ...formData.getHeaders() },
    })

    res.status(data.code).json(data)
  } catch (error: unknown) {
    handleError(res, error)
  }
}
