import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { AppError, handleError } from '@/utils/errorHandler'
import httpClient from '@/utils/httpClient'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import FormData from 'form-data'

import { AnalysisType, REQUIRED_FILES } from '@/constant'
import { supabase } from '@/utils/supabaseClient'
import { ApiResponse } from '@/types/response_data.type'

dotenv.config()

export const createAnalysis = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { data } = await httpClient.post<ApiResponse<string>>(`/?type=${type}`, formData, {
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
      .from('exam_analysis')
      .select('*, projects(name ,total_options,total_students,total_questions)')
      .eq('project_id', projectId)
      .single()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Project not found', 404)
    }

    res.status(200).json({ message: 'General details retrieved', data, code: 200 })
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

    const { data, error } = await supabase.from('projects').select('histogram').single()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Project not found', 404)
    }

    res.status(200).json({ message: 'Histogram data retrieved', data: data.histogram, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getAllQuestionAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.query

    if (!examId) {
      throw new AppError('Query parameter "examId" is required', 400)
    }

    const { data, error } = await supabase
      .from('questions')
      .select('id,exam_id,content,question_analysis(discrimination_index,difficulty_index,rpbis,selection_rate)')
      .eq('exam_id', examId)

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Exam id not found', 404)
    }

    res.status(200).json({ message: 'All question analyses retrieved', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getOptionAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.query

    if (!questionId) {
      throw new AppError('Query parameters "questionId" are required', 400)
    }

    const { data, error } = await supabase
      .from('options') // Assuming 'options' is the table storing question options
      .select('id, content, option_analysis(discrimination_index, rpbis, selection_rate)')
      .eq('question_id', questionId)

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Exam id not found', 404)
    }

    res.status(200).json({ message: 'Specific question analysis retrieved', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}
