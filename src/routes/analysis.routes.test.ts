import httpClient from '@/utils/httpClient'
import { supabase } from '@/utils/supabaseClient'
import { NextFunction } from 'express'
import path from 'path'
import request from 'supertest'
import app from '..'
import { AnalysisType } from '@/constant'

jest.mock('@/middlewares/auth.middleware', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authMiddleware: (_req: any, _res: any, next: NextFunction) => next(),
}))

jest.mock('@/utils/httpClient', () => ({
  post: jest.fn(),
}))

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
      returns: jest.fn(),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  },
}))

const resultFilePath = path.join(__dirname, '../tests/__mocks__/result.xlsx')
const examFilePath = path.join(__dirname, '../tests/__mocks__/exam.csv')

describe('GET /api/* analysis routes', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/analyze', () => {
    it.each`
      case | desc                                  | query                          | filesProvided | flaskResponse                                  | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with valid input'}     | ${`?type=${AnalysisType.CTT}`} | ${true}       | ${{ code: 200, message: 'Success', data: {} }} | ${200}         | ${'Success'}
      ${2} | ${'returns 400 when type is missing'} | ${''}                          | ${true}       | ${undefined}                                   | ${400}         | ${'Query parameter "type" is required'}
      ${3} | ${'returns 400 when file is missing'} | ${`?type=${AnalysisType.CTT}`} | ${false}      | ${undefined}                                   | ${400}         | ${'Missing file: result_file'}
      ${4} | ${'returns 500 when Flask fails'}     | ${`?type=${AnalysisType.CTT}`} | ${true}       | ${null}                                        | ${500}         | ${'Analysis failed'}
    `('($case) $desc', async ({ query, filesProvided, flaskResponse, expectedStatus, expectedMessage }) => {
      if (flaskResponse !== undefined) {
        ;(httpClient.post as jest.Mock).mockResolvedValue({ data: flaskResponse })
      }

      const req = request(app)
        .post(`/api/analyze${query}`)
        .field('projectName', 'My Project') // optional fields
        .field('numberOfGroup', '3')
        .field('groupPercentage', '30')
        .field('correlationRpbis', '0.2')

      if (filesProvided) {
        req.attach('result_file', path.resolve(resultFilePath)).attach('exam_file', path.resolve(examFilePath))
      }

      const res = await req

      expect(res.status).toBe(expectedStatus)
      expect(res.body.message).toBe(expectedMessage)
    })
  })
  describe('GET routes success', () => {
    it.each`
      case | path                         | queryParamKey   | queryValue   | supabaseResult                                   | expectedMessage                           | useReturns
      ${1} | ${'/api/general-details'}    | ${'projectId'}  | ${'proj123'} | ${{ data: { name: 'Test Project' } }}            | ${'General details retrieved'}            | ${false}
      ${2} | ${'/api/histogram'}          | ${'projectId'}  | ${'proj123'} | ${{ data: { histogram: [1, 2, 3] } }}            | ${'Histogram data retrieved'}             | ${false}
      ${3} | ${'/api/questions-analysis'} | ${'projectId'}  | ${'proj123'} | ${{ data: [{ id: 'q1', content: 'Q1?' }] }}      | ${'All question analyses retrieved'}      | ${true}
      ${4} | ${'/api/question-analysis'}  | ${'questionId'} | ${'q123'}    | ${{ data: { id: 'q123', content: 'Q123?' } }}    | ${'Specific question analysis retrieved'} | ${false}
      ${5} | ${'/api/options-analysis'}   | ${'questionId'} | ${'q123'}    | ${{ data: [{ id: 'o1', content: 'Option 1' }] }} | ${'Specific question analysis retrieved'} | ${true}
      ${6} | ${'/api/option-analysis'}    | ${'optionId'}   | ${'opt123'}  | ${{ data: { id: 'opt123', content: 'Opt A' } }}  | ${'Specific question analysis retrieved'} | ${false}
    `(
      '($case) $path returns 200 with valid $queryParamKey',
      async ({ case: caseNum, path, queryParamKey, queryValue, supabaseResult, expectedMessage, useReturns }) => {
        if (caseNum === 3) {
          // questions-analysis needs two chained .from() calls
          ;(supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'exam_analysis') {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: { exam_id: 'exam123' } }),
              }
            }

            if (table === 'questions') {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                returns: jest.fn().mockResolvedValue(supabaseResult),
              }
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
            return {} as any
          })
        } else {
          // all other routes only call .from() once
          ;(supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            ...(useReturns
              ? { returns: jest.fn().mockResolvedValue(supabaseResult) }
              : {
                  maybeSingle: jest.fn().mockResolvedValue(supabaseResult),
                  single: jest.fn().mockResolvedValue(supabaseResult),
                  returns: jest.fn().mockReturnThis(),
                }),
          })
        }

        const res = await request(app)
          .get(path)
          .query({ [queryParamKey]: queryValue })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe(expectedMessage)
      }
    )
  })

  describe('GET routes with error', () => {
    it.each`
      case | path                         | queryParamKey   | expectedMessage
      ${1} | ${'/api/general-details'}    | ${'projectId'}  | ${'Query parameter "projectId" is required'}
      ${2} | ${'/api/histogram'}          | ${'projectId'}  | ${'Query parameter "projectId" is required'}
      ${3} | ${'/api/questions-analysis'} | ${'projectId'}  | ${'Query parameter "projectId" is required'}
      ${4} | ${'/api/question-analysis'}  | ${'questionId'} | ${'Query parameters "questionId" are required'}
      ${5} | ${'/api/options-analysis'}   | ${'questionId'} | ${'Query parameters "questionId" are required'}
      ${6} | ${'/api/option-analysis'}    | ${'optionId'}   | ${'Query parameters "optionId" are required'}
    `('($case) $path returns 400 if $queryParamKey is missing', async ({ path, expectedMessage }) => {
      const res = await request(app).get(path)
      expect(res.status).toBe(400)
      expect(res.body.message).toBe(expectedMessage)
    })
  })
})
