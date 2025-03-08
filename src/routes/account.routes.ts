import { getMyProfile, getMyProjects } from '@/controllers/account.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { Router } from 'express'

const router = Router()

router.get('/profile', authMiddleware, getMyProfile)
router.get('/projects', authMiddleware, getMyProjects)

export const accountRoutes = router
