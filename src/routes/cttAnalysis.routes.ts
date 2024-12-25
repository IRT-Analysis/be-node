import { getAnalyzedItemById, getGeneralDetailById } from '@/controllers/analysis.controller'
import { uploadFile } from '@/controllers/media.controller'
import multerMiddleware from '@/middlewares/multer.middleware'
import { Router } from 'express'

const router = Router()

const PREFIX = 'ctt'
router.post(`/${PREFIX}/analyze`, multerMiddleware, uploadFile)

router.get(`/${PREFIX}/items/:id`, getAnalyzedItemById)

router.get(`/${PREFIX}/general-detail/:id`, getGeneralDetailById)

export const analysisRoutes = router
