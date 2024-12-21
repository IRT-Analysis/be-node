import axios from 'axios'
import { Request, Response } from 'express'

import dotenv from 'dotenv'

dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAnalyzedItemById = async (req: Request, res: Response): Promise<any> => {
  try {
    // const { jobId } = req.params
    // Retrieve the result using the jobId
    // const response = await axios.get(`${process.env.FLASK_API_ENDPOINT}/api/analyze/ctt/${jobId}`)
    const response = await axios.get(`${process.env.FLASK_API_ENDPOINT}/ctt/${req.params.id}`)
    const result = response.data as { message: string; data: unknown }
    if (!result) {
      return res.status(response.status).json({ message: (result as { message: string }).message })
    }
    return res.status(response.status).json(result)
  } catch (error: unknown) {
    console.error(error)
    return res.status(500).json({ message: 'An unexpected error occurred.' })
  }
}

export const getGeneralDetailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(`${process.env.FLASK_API_ENDPOINT}/ctt/${req.params.id}/general-detail`)
    const result = response.data as { message: string; data: unknown }
    if (!result) {
      res.status(response.status).json({ message: (result as { message: string }).message })
      return
    }
    res.status(response.status).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'An unexpected error occurred.' })
  }
}

export const getAverageDetailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(`${process.env.FLASK_API_ENDPOINT}/ctt/${req.params.id}/average-detail`)
    const result = response.data as { message: string; data: unknown }
    if (!result) {
      res.status(response.status).json({ message: (result as { message: string }).message })
      return
    }
    res.status(response.status).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'An unexpected error occurred.' })
  }
}
