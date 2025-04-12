import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { MyProfileResType, MyProjectsResType } from '@/schema/account.schema'
import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { Response } from 'express'

export const getMyProfile = async (req: AuthenticatedRequest, res: Response<MyProfileResType>): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(req.cookies.auth_token)
    if (!user) {
      throw new AppError('User not found', 401)
    }

    res.status(200).json({ message: 'User retrieved successfully', data: user, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getMyProjects = async (req: AuthenticatedRequest, res: Response<MyProjectsResType>): Promise<void> => {
  try {
    const user = req['user']

    if (!user) {
      throw new AppError('User not found', 401)
    }

    const { data, error } = await supabase
      .from('projects')
      .select('created_at,user_id,name,id,total_questions,total_students,total_options,type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ message: 'Projects retrieved successfully', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}
