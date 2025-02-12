import { Request, Response } from 'express'

import dotenv from 'dotenv'
import { handleError } from '@/middlewares/error.middleware'
import httpClient from '@/utils/httpClient'

dotenv.config()

export class AppError extends Error {
  public status: number
  public error?: Record<string, unknown>

  constructor(message: string, status: number, error?: Record<string, unknown>) {
    super()
    this.message = message
    this.status = status
    if (error) this.error = error

    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAnalyzedItemById = async (req: Request, res: Response): Promise<any> => {
  try {
    // const { jobId } = req.params
    // Retrieve the result using the jobId
    // const response = await axios.get(`${process.env.FLASK_API_ENDPOINT}/api/analyze/ctt/${jobId}`)
    const response = await httpClient.get(`/ctt/${req.params.id}`)
    const result = response.data as { message: string; data: unknown }
    if (!result) {
      return res.status(response.status).json({ message: (result as { message: string }).message })
    }
    return res.status(response.status).json(result)
  } catch (error: unknown) {
    // console.error(error)
    handleError(res, error)
  }
}

export const getGeneralDetailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await httpClient.get(`/ctt/${req.params.id}/general-detail`)
    const result = response.data as { message: string; data: unknown }
    if (!result) {
      res.status(response.status).json({ message: (result as { message: string }).message })
      return
    }
    res.status(response.status).json(result)
  } catch (error) {
    console.error(error)
    handleError(res, error)
  }
}
