import {
  createAnalysis,
  getAllQuestionAnalysis,
  getGeneralDetails,
  getHistogramData,
  getOptionAnalysis,
  getOptionsAnalysis,
  getQuestionAnalysis,
  getStudentResult,
  getStudentsByProjectId,
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

const ROUTES = {
  ANALYZE: '/analyze',
  GENERAL_DETAILS: '/general-details',
  HISTOGRAM: '/histogram',
  QUESTIONS_ANALYSIS: '/questions',
  QUESTION_ANALYSIS: '/question',
  OPTIONS_ANALYSIS: '/options',
  OPTION_ANALYSIS: '/option',
  STUDENTS_ANALYSIS: '/students',
  STUDENT_RESULT: '/student',
}

router.post(ROUTES.ANALYZE, multerMiddleware, createAnalysis)

router.get(ROUTES.GENERAL_DETAILS, getGeneralDetails)
router.get(ROUTES.HISTOGRAM, getHistogramData)
router.get(ROUTES.QUESTIONS_ANALYSIS, getAllQuestionAnalysis)
router.get(ROUTES.QUESTION_ANALYSIS, getQuestionAnalysis)
router.get(ROUTES.OPTIONS_ANALYSIS, getOptionsAnalysis)
router.get(ROUTES.OPTION_ANALYSIS, getOptionAnalysis)
router.get(ROUTES.STUDENTS_ANALYSIS, getStudentsByProjectId)
router.get(ROUTES.STUDENT_RESULT, getStudentResult)

export const analysisRoutes = router
