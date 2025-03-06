import { uploadFile } from '@/controllers/media.controller'
import multerMiddleware from '@/middlewares/multer.middleware'
import { Router } from 'express'

const router = Router()

const PREFIX = 'ctt'
router.post(`/${PREFIX}/analyze`, multerMiddleware, uploadFile)

export const analysisRoutes = router
