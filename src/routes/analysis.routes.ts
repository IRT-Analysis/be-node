import {
  createAnalysis,
  getAllQuestionAnalysis,
  getGeneralDetails,
  getHistogramData,
  getOptionsAnalysis,
  getOptionAnalysis,
  getQuestionAnalysis,
} from '@/controllers/analysis.controller'
import multerMiddleware from '@/middlewares/multer.middleware'
import { Router } from 'express'

const router = Router()

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a media file
 *     description: Uploads a file using Multer middleware and returns the file URL.
 *     tags:
 *       - Media
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 fileUrl:
 *                   type: string
 *                   example: https://your-storage.com/uploads/file.jpg
 *       400:
 *         description: Bad request, file not provided
 *       500:
 *         description: Internal server error
 */

router.post(`/analyze`, multerMiddleware, createAnalysis)

router.get('/general-details', getGeneralDetails)
router.get('/histogram', getHistogramData)
router.get('/questions-analysis', getAllQuestionAnalysis)
router.get('/question-analysis', getQuestionAnalysis)
router.get('/options-analysis', getOptionsAnalysis)
router.get('/option-analysis', getOptionAnalysis)

export const analysisRoutes = router
