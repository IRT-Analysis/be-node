import { Request, Response } from 'express'

interface AuthenticatedRequest extends Request {
  email?: string
}

export const secretController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
