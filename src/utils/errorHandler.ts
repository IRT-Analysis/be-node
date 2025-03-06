import axios, { AxiosError } from 'axios'
import { Response } from 'express'

type ErrorFlaskResponse = {
  code: number
  message: string
  error?: Record<string, unknown>
}

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

export const createError = (code: number, message: string, error?: Record<string, unknown>): AppError => {
  return new AppError(message, code, error)
}

export const handleError = (res: Response, error: unknown): void => {
  console.log('Error:', error)

  if (error instanceof AppError) {
    // Handle custom AppError
    res.status(error.status).json({
      message: error.message,
      error: error.error || null,
      code: error.status,
    })
    return
  }

  if (axios.isAxiosError(error)) {
    // Handle Axios error from Flask API
    const axiosError = error as AxiosError<ErrorFlaskResponse>

    if (axiosError.response) {
      const { message, code: status, error: details } = axiosError.response.data

      res.status(status).json({
        message,
        error: details || null,
        code: status,
      })
      return
    }
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error)
  res.status(500).json({
    message: 'An unexpected error occurred.',
    error: String(error),
    code: 500,
  })
}
