import { secretController } from '@/controllers/secret.controller'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { Router } from 'express'

const router = Router()

router.get('/secret', authMiddleware, secretController)

export const secretRoutes = router
