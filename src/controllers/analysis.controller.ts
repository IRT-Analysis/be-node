import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { AppError, handleError } from '@/utils/errorHandler'
import httpClient from '@/utils/httpClient'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import FormData from 'form-data'

import { AnalysisType, REQUIRED_FILES } from '@/constant'
import { supabase } from '@/utils/supabaseClient'

dotenv.config()

type FlaskResponse<T> = {
  code: number
  message: string
  data: T
}

export const createAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.query as { type: keyof typeof AnalysisType }

    if (!type) {
      throw new AppError('Query parameter "id" is required', 400)
    }

    const files = req.files as { [key: string]: Express.Multer.File[] }

    for (const fileKey of REQUIRED_FILES) {
      if (!files[fileKey] || files[fileKey].length === 0) {
        throw new AppError(`Missing file: ${fileKey}`, 400)
      }
    }

    const formData = new FormData()
    for (const fileKey of REQUIRED_FILES) {
      const file = files[fileKey][0]
      formData.append(fileKey, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })
    }

    const { data } = await httpClient.post<FlaskResponse<string>>(`/?type=${type}}`, formData, {
      headers: { ...formData.getHeaders() },
    })

    res.status(data.code).json(data)
  } catch (error) {
    handleError(res, error)
  }
}

export const getGeneralDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    const { data, error } = await supabase
      .from('exam_analysis') // Replace 'projects' with your actual table name
      .select('*, projects(*)')
      .eq('project_id', projectId)
      .single()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Project not found', 404)
    }

    res.status(200).json({ message: 'General details retrieved', data })
  } catch (error) {
    handleError(res, error)
  }
}

export const getHistogramData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    res.status(200).json({ message: 'Histogram data retrieved', projectId })
  } catch (error) {
    handleError(res, error)
  }
}

export const getAllQuestionAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    res.status(200).json({ message: 'All question analyses retrieved', projectId })
  } catch (error) {
    handleError(res, error)
  }
}

export const getQuestionAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, questionId } = req.query

    if (!projectId || !questionId) {
      throw new AppError('Query parameters "projectId" and "questionId" are required', 400)
    }

    res.status(200).json({ message: 'Specific question analysis retrieved', projectId, questionId })
  } catch (error) {
    handleError(res, error)
  }
}
