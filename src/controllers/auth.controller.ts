import { Request, Response } from 'express'

interface AuthenticatedRequest extends Request {
  email?: string
}

export const signIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userEmail = req.email
  try {
    if (!userEmail) {
      throw new Error('Email not found in request')
    }
    res.json({ message: `Our hidden value for the user ${userEmail}` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'User signed up successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
