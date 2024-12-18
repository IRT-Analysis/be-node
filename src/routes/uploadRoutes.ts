import { uploadFile } from '@/controllers/createAnalysis'
import multerMiddleware from '@/middlewares/multerMiddleware'
import { Router } from 'express'

const router = Router()

router.post('/upload', multerMiddleware, uploadFile)

export const uploadRoutes = router
