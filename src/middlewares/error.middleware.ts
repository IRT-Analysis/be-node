import { AppError, createError } from '@/utils/errorHandler'
import { NextFunction, Request, Response } from 'express'

export const invalidPathHandler = (_request: Request, response: Response, _next: NextFunction): void => {
  response.status(404).json(createError(404, 'Path not found'))
}

export const errorHandler = (err: AppError, _request: Request, response: Response, _next: NextFunction): void => {
  const statusCode = err instanceof AppError ? err.status : 500
  const message = err.message || 'Internal Server Error'
  response.status(500).json({ message, code: statusCode })
}
