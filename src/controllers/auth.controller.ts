import { SignInReqType, SignInResType, SignOutResType, SignUpReqType, SignUpResType } from '@/schema/auth.schema'
import { AppError, handleError } from '@/utils/errorHandler'
import { supabase } from '@/utils/supabaseClient'
import { Request, Response } from 'express'

export const signIn = async (req: Request, res: Response<SignInResType>): Promise<void> => {
  try {
    const { email, password } = req.body as SignInReqType

    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AppError(error.message, 400)
    }

    if (!data || !data.session) {
      throw new AppError('Login failed: No session returned', 400)
    }

    const token = data.session.access_token

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      message: 'User signed in successfully',
      data,
      code: 200,
    })
  } catch (error) {
    handleError(res, error)
  }
}

export const signUp = async (req: Request, res: Response<SignUpResType>): Promise<void> => {
  try {
    const { email, password, option } = req.body as SignUpReqType

    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: option },
    })

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ message: 'User signed up successfully', data, code: 201 })
  } catch (error) {
    handleError(res, error)
  }
}

export const signOut = async (_req: Request, res: Response<SignOutResType>): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new AppError(error.message, 400)
    }

    res.status(200).json({ code: 200, message: 'User signed out successfully' })
  } catch (error) {
    handleError(res, error)
  }
}
