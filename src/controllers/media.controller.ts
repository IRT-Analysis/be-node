import FormData from 'form-data'
import { Request, Response } from 'express'

import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const formData = new FormData()

    formData.append('file', req.file.buffer as Buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    const response = await axios.post(`${process.env.FLASK_API_ENDPOINT}/ctt`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    })

    res.status(201).json(response.data)
  } catch (error) {
    console.error('Error uploading file:', error)
    res.status(500).json({
      message: 'Failed to process file',
      error: (error as Error).message,
    })
  }
}
