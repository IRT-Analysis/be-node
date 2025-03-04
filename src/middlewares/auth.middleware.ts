import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  email?: string
  userId?: string
}
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]
  const jwtSecret = process.env.SUPABASE_JWT_SECRET!

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing token' })
    return
  }

  jwt.verify(token, jwtSecret, (err, decoded: unknown) => {
    if (err) {
      console.error('Error parsing token:', err)
      return res.status(401).json({ error: 'Unauthorized: Invalid token' })
    }
    const payload = decoded as { email: string; sub: string }
    req.email = payload.email
    req.userId = payload.sub
    next()
  })
}
