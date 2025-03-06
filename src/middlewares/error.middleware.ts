import { createError } from '@/utils/errorHandler'
import { NextFunction, Request, Response } from 'express'

export const invalidPathHandler = (_request: Request, response: Response, _next: NextFunction): void => {
  response.status(404).json(createError(404, 'Path not found'))
}
