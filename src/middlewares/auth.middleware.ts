import { UserType } from '@/types/user.type'
import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { NextFunction, Request, Response } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: UserType
  cookies: {
    auth_token?: string
  }
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies['auth_token']

    if (!token) {
      throw new AppError('Unauthorized: Missing token', 401)
    }

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
