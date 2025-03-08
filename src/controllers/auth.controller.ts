import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { Request, Response } from 'express'

interface AuthenticatedRequest extends Request {
  email?: string
}

export const signIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ message: 'User signed in successfully', data, code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ message: 'User signed up successfully', data, code: 201 })
  } catch (error) {
    console.error(error)
    handleError(res, error)
  }
}

export const signOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ message: 'User signed out successfully', code: 200 })
  } catch (error) {
    handleError(res, error)
  }
}
