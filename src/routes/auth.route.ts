import { signIn, signOut, signUp } from '@/controllers/auth.controller'
// import { authMiddleware } from '@/middlewares/auth.middleware'
import { Router } from 'express'

const router = Router()

router.post('/signin', signIn)
router.post('/signup', signUp)
router.post('/signout', signOut)

export const authRoutes = router
