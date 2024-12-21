import { uploadFile } from '@/controllers/media.controller'
import multerMiddleware from '@/middlewares/multerMiddleware'
import { Router } from 'express'

const router = Router()

router.post('/upload', multerMiddleware, uploadFile)

export const uploadRoutes = router
