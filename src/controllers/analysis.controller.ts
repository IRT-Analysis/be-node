import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { AppError, handleError } from '@/utils/errorHandler'
import httpClient from '@/utils/httpClient'
import dotenv from 'dotenv'
import { Response } from 'express'
import FormData from 'form-data'
import {
  AnalyzeRequestType,
  AnalyzeResType,
  GetAllQuestionAnalysisResType,
  GetGeneralDetailsQueryType,
  GetHistogramResType,
  GetOptionAnalysisResType,
  GetOptionsAnalysisResType,
  GetQuestionAnalysisResType,
  GetStudentResultQueryType,
  GetStudentResultResType,
  GetStudentsAnalysisQueryType,
  GetStudentsAnalysisResType,
  OptionAnalysisType,
  QuestionAnalysisType,
  StudentResultType,
  SupabaseStudentExamRaw,
} from './../schema/analysis.schema'

import { AnalysisType, REQUIRED_FILES } from '@/constant'
import { GetGeneralDetailsResType } from '@/schema/analysis.schema'
import { supabase } from '@/utils/supabaseClient'

dotenv.config()

export const createAnalysis = async (req: AuthenticatedRequest, res: Response<AnalyzeResType>): Promise<void> => {
  try {
    const { type } = req.query as { type: keyof typeof AnalysisType }

    if (!type) {
      throw new AppError('Query parameter "type" is required', 400)
    }

    const files = req.files as { [key: string]: Express.Multer.File[] }

    for (const fileKey of REQUIRED_FILES) {
      if (!files[fileKey] || files[fileKey].length === 0) {
        throw new AppError(`Missing file: ${fileKey}`, 400)
      }
    }

    const { projectName, numberOfGroup, groupPercentage, correlationRpbis } = req.body as AnalyzeRequestType

    const formData = new FormData()

    for (const fileKey of REQUIRED_FILES) {
      const file = files[fileKey][0]
      formData.append(fileKey, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      })
    }

    if (projectName) formData.append('projectName', projectName)
    if (numberOfGroup) formData.append('numberOfGroup', numberOfGroup.toString())
    if (groupPercentage) formData.append('groupPercentage', groupPercentage.toString())
    if (correlationRpbis) formData.append('correlationRpbis', correlationRpbis.toString())

    const { data } = await httpClient.post<AnalyzeResType>(`/?type=${type}`, formData, {
      headers: { ...formData.getHeaders(), Cookie: req.headers.cookie },
      withCredentials: true,
    })

    if (!data) {
      throw new AppError('Analysis failed', 500)
    }

    res.status(data.code).json(data)
  } catch (error) {
    handleError(res, error)
  }
}

export const getGeneralDetails = async (
  req: AuthenticatedRequest,
  res: Response<GetGeneralDetailsResType>
): Promise<void> => {
  try {
    const { projectId } = req.query as GetGeneralDetailsQueryType

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    const { data, error } = await supabase
      .from('exam_analysis')
      .select('*, projects(name,total_options,total_students,total_questions)')
      .eq('project_id', projectId)
      .maybeSingle()

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

export const getHistogramData = async (
  req: AuthenticatedRequest,
  res: Response<GetHistogramResType>
): Promise<void> => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    const { data, error } = await supabase.from('projects').select('histogram').eq('id', projectId).maybeSingle()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Project not found', 404)
    }

    res.status(200).json({ message: 'Histogram data retrieved', data: data?.histogram, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getAllQuestionAnalysis = async (
  req: AuthenticatedRequest,
  res: Response<GetAllQuestionAnalysisResType>
): Promise<void> => {
  try {
    const { projectId } = req.query

    if (!projectId) {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    const { data: examData, error } = await supabase
      .from('exam_analysis')
      .select('exam_id')
      .eq('project_id', projectId)
      .single()

    const examId = examData?.exam_id

    console.log('Exam ID:', examData)

    if (!examId) {
      throw new AppError('Exam not found', 404)
    }

    const { data, error: questionsError } = await supabase
      .from('questions')
      .select(
        'id, exam_id, content, question_analysis(discrimination_index, difficulty_index, rpbis, selection_rate, group_choice_percentages)'
      )
      .eq('exam_id', examId)
      .returns<QuestionAnalysisType[]>()

    if (questionsError) {
      throw new AppError(`Supabase error: ${questionsError.message}`, 500)
    }

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Questions not found', 404)
    }

    res.status(200).json({ message: 'All question analyses retrieved', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getQuestionAnalysis = async (
  req: AuthenticatedRequest,
  res: Response<GetQuestionAnalysisResType>
): Promise<void> => {
  try {
    const { questionId } = req.query

    if (!questionId) {
      throw new AppError('Query parameters "questionId" are required', 400)
    }

    const { data, error } = await supabase
      .from('questions')
      .select(
        'id,exam_id,content,question_analysis(discrimination_index,difficulty_index,rpbis,selection_rate,group_choice_percentages)'
      )
      .eq('id', questionId)
      .returns<QuestionAnalysisType>()
      .maybeSingle()
    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Question not found', 404)
    }

    res.status(200).json({ message: 'Specific question analysis retrieved', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getOptionsAnalysis = async (
  req: AuthenticatedRequest,
  res: Response<GetOptionsAnalysisResType>
): Promise<void> => {
  try {
    const { questionId } = req.query

    if (!questionId) {
      throw new AppError('Query parameters "questionId" are required', 400)
    }

    const { data, error } = await supabase
      .from('options')
      .select(
        'id, content, option_analysis(discrimination_index, rpbis, selection_rate, selected_by, top_selected, bottom_selected)'
      )
      .eq('question_id', questionId)
      .returns<OptionAnalysisType[]>()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Exam not found', 404)
    }

    res.status(200).json({ message: 'Specific question analysis retrieved', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getOptionAnalysis = async (
  req: AuthenticatedRequest,
  res: Response<GetOptionAnalysisResType>
): Promise<void> => {
  try {
    const { optionId } = req.query

    if (!optionId) {
      throw new AppError('Query parameters "optionId" are required', 400)
    }

    const { data, error } = await supabase
      .from('options')
      .select(
        'id, content, option_analysis(discrimination_index, rpbis, selection_rate, selected_by, top_selected, bottom_selected)'
      )
      .eq('id', optionId)
      .maybeSingle()

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('Option not found', 404)
    }

    res
      .status(200)
      .json({ message: 'Specific question analysis retrieved', data: data as unknown as OptionAnalysisType, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

// Need to be tested
export const getStudentResult = async (
  req: AuthenticatedRequest,
  res: Response<GetStudentResultResType>
): Promise<void> => {
  try {
    const { studentExamId } = req.query as { studentExamId: GetStudentResultQueryType['studentExamId'] }

    if (!studentExamId) {
      throw new AppError('Query parameter "studentExamId" is required', 400)
    }

    const { data, error } = await supabase
      .from('student_exams')
      .select(
        `
        id,
        first_name,
        last_name,
        total_score,
        exam_id,
        student_id,
        grade,
        middle_name,
        answers:student_answers (
          is_correct,
          selected_option:options (
            id,
            content
          ),
          question:questions (
            id,
            content,
            correct_option:options!questions_correct_option_id_fkey (
              id,
              content
            )
          )
        )
      `
      )
      .eq('id', studentExamId)
      .returns<SupabaseStudentExamRaw[]>()
      .single()

    if (error) {
      throw new AppError(`Supabase RPC error: ${error.message}`, 500)
    }

    if (!data) {
      throw new AppError('No student result found', 404)
    }

    const exam = data

    const formatted: StudentResultType = {
      student_exam_id: exam.id,
      first_name: exam.first_name,
      last_name: exam.last_name,
      middle_name: exam.middle_name,
      grade: exam.grade,
      student_id: exam.student_id,
      total_score: exam.total_score,
      exam_id: exam.exam_id,
      answers: exam.answers.map((a) => ({
        question_id: a.question.id,
        question_content: a.question.content,
        correct_option_id: a.question.correct_option?.id,
        correct_option_content: a.question.correct_option?.content,
        is_correct: a.is_correct,
        selected_option: a.selected_option,
      })),
    }

    res.status(200).json({
      message: 'Student result retrieved',
      data: formatted,
      code: 200,
    })
  } catch (error) {
    handleError(res, error)
  }
}

// Need to be tested
export const getStudentsByProjectId = async (
  req: AuthenticatedRequest,
  res: Response<GetStudentsAnalysisResType>
): Promise<void> => {
  try {
    const { projectId } = req.query as GetStudentsAnalysisQueryType

    if (!projectId || typeof projectId !== 'string') {
      throw new AppError('Query parameter "projectId" is required', 400)
    }

    const { data, error } = await supabase.rpc('get_students_by_project_id', {
      _project_id: projectId, // match the SQL function param name
    })

    if (error) {
      throw new AppError(`Supabase error: ${error.message}`, 500)
    }

    res.status(200).json({
      message: 'Students retrieved successfully',
      data,
      code: 200,
    })
  } catch (err) {
    handleError(res, err)
  }
}
