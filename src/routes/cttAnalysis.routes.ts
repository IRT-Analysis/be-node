import { getAnalyzedItemById, getAverageDetailById, getGeneralDetailById } from '@/controllers/analysis.controller'
import { uploadFile } from '@/controllers/media.controller'
import multerMiddleware from '@/middlewares/multerMiddleware'
import { Router } from 'express'

const router = Router()

const PREFIX = 'ctt'
router.post(`/${PREFIX}/analyze`, multerMiddleware, uploadFile)

router.get(`/${PREFIX}/items/:id`, getAnalyzedItemById)

router.get(`/${PREFIX}/general-detail/:id`, getGeneralDetailById)

router.get(`/${PREFIX}/average-detail/:id`, getAverageDetailById)

export const analysisRoutes = router
