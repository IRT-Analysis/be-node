import FormData from 'form-data'
import { Response } from 'express'
import dotenv from 'dotenv'
import httpClient from '@/utils/httpClient'
import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { AppError, handleError } from '@/utils/errorHandler'

dotenv.config()

type FlaskResponse<T> = {
  code: number
  message: string
  data: T
}

export const uploadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Validate and access files
    const requiredFiles = ['result_file', 'exam_file']
    const files = req.files as { [key: string]: Express.Multer.File[] }

    for (const fileKey of requiredFiles) {
      if (!files[fileKey] || files[fileKey].length === 0) {
        throw new AppError(`Missing file: ${fileKey}`, 400)
      }
    }

    const formData = new FormData()
    for (const fileKey of requiredFiles) {
      const file = files[fileKey][0]
      formData.append(fileKey, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })
    }

    // Send files to Flask API
    const { data } = await httpClient.post<FlaskResponse<string>>(`/`, formData, {
      headers: { ...formData.getHeaders() },
    })

    res.status(data.code).json(data)
  } catch (error: unknown) {
    handleError(res, error)
  }
}
