import { signIn, signUp } from '@/controllers/auth.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { Router } from 'express'

const router = Router()

router.post('/signin', authMiddleware, signIn)
router.post('/signup', authMiddleware, signUp)

export const authRoutes = router
