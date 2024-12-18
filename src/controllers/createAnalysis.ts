import { Request, Response } from 'express'
import { analyzeFileWithFlask } from '@/services/flaskService'

import dotenv from 'dotenv'
dotenv.config()

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const result = await analyzeFileWithFlask(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      `${process.env.FLASK_API_ENDPOINT}/api/analyze/ctt`
    )
    res.status(200).json(result)
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({
      message: 'Failed to process file',
      error: (error as Error).message,
    })
  }
}
