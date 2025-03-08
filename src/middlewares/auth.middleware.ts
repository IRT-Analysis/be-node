import { UserType } from '@/types/user.type'
import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { NextFunction, Request, Response } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: UserType
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid token', 401)
    }

    const token = authHeader.replace('Bearer ', '')

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data?.user) {
      throw new AppError('Unauthorized: Invalid token', 401)
    }

    req.user = {
      id: data.user.id,
      email: data.user.email!,
      role: data.user.role!,
    }

    next()
  } catch (error) {
    handleError(res, error)
  }
}
