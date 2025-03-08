import { AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { Response } from 'express'

export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req['user']

    if (!user) {
      throw new AppError('User not found', 401)
    }

    res.status(200).json({ message: 'User retrieved successfully', data: user, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const getMyProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req['user']

    if (!user) {
      throw new AppError('User not found', 401)
    }

    const { data, error } = await supabase
      .from('projects')
      .select('id,name,description')
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
