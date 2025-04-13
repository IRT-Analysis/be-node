import { AnalysisType, REQUIRED_FILES } from '@/constant'
import {
  createAnalysis,
  getAllQuestionAnalysis,
  getGeneralDetails,
  getHistogramData,
  getOptionAnalysis,
  getOptionsAnalysis,
  getQuestionAnalysis,
  getRaschAnalysis,
  getStudentResult,
  getStudentsByProjectId,
} from '@/controllers/analysis.controller'
import httpClient from '@/utils/httpClient'
import { supabase } from '@/utils/supabaseClient'
import httpMocks from 'node-mocks-http'

jest.mock('@/utils/httpClient', () => ({
  post: jest.fn(),
}))

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  },
}))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

afterEach(() => {
  jest.clearAllMocks()
})
describe('Analysis Controller', () => {
  describe('createAnalysis', () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'file.csv',
      mimetype: 'text/csv',
    }
    const generateFiles = (includeAll = true): Record<string, Express.Multer.File[]> => {
      return REQUIRED_FILES.reduce(
        (acc, key, index) => {
          if (includeAll || index !== 0) acc[key] = [mockFile as Express.Multer.File]
          return acc
        },
        {} as Record<string, Express.Multer.File[]>
      )
    }

    it.each`
      case | desc                                     | query                         | body                                                           | files                   | flaskRes                                           | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with valid input'}        | ${{ type: AnalysisType.CTT }} | ${{ projectName: 'P', numberOfGroup: 2, groupPercentage: 20 }} | ${generateFiles()}      | ${{ data: { code: 200, message: 'Analysis OK' } }} | ${200}         | ${'Analysis OK'}
      ${2} | ${'returns 400 when type is missing'}    | ${{}}                         | ${{}}                                                          | ${generateFiles()}      | ${undefined}                                       | ${400}         | ${'Query parameter "type" is required'}
      ${3} | ${'returns 400 when file is missing'}    | ${{ type: AnalysisType.CTT }} | ${{}}                                                          | ${generateFiles(false)} | ${undefined}                                       | ${400}         | ${'Missing file'}
      ${4} | ${'returns 500 when Flask returns null'} | ${{ type: AnalysisType.CTT }} | ${{ projectName: 'P' }}                                        | ${generateFiles()}      | ${{ data: null }}                                  | ${500}         | ${'Analysis failed'}
    `('($case) $desc', async ({ query, body, files, flaskRes, expectedStatus, expectedMessage }) => {
      const req = httpMocks.createRequest({
        method: 'POST',
        query,
        body,
        files,
        headers: { cookie: 'auth_token=fake' },
      })
      const res = httpMocks.createResponse()

      if (flaskRes !== undefined) {
        ;(httpClient.post as jest.Mock).mockResolvedValue(flaskRes)
      }

      await createAnalysis(req, res)

      const json = res._getJSONData()
      expect(res.statusCode).toBe(expectedStatus)
      expect(json.message).toContain(expectedMessage)
    })
  })

  describe('getGeneralDetails', () => {
    it.each`
      case | desc                                     | query                        | supabaseResult                              | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with valid projectId'}    | ${{ projectId: 'abc123' }}   | ${{ data: { project_id: 'abc123' } }}       | ${200}         | ${'General details retrieved'}
      ${2} | ${'returns 400 if projectId is missing'} | ${{}}                        | ${undefined}                                | ${400}         | ${'Query parameter "projectId" is required'}
      ${3} | ${'returns 500 on supabase error'}       | ${{ projectId: 'error' }}    | ${{ error: { message: 'Database error' } }} | ${500}         | ${'Supabase error: Database error'}
      ${4} | ${'returns 404 if no project found'}     | ${{ projectId: 'notfound' }} | ${{ data: null }}                           | ${404}         | ${'Project not found'}
    `('($case) $desc', async ({ query, supabaseResult, expectedStatus, expectedMessage }) => {
      const mockMaybeSingle = jest.fn().mockResolvedValue(supabaseResult)
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      })

      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      await getGeneralDetails(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
    })
  })

  describe('getHistogramData', () => {
    it.each`
      case | desc                                     | query                        | supabaseResult                                 | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with histogram data'}     | ${{ projectId: 'proj123' }}  | ${{ data: { histogram: [1, 2, 3] } }}          | ${200}         | ${'Histogram data retrieved'}
      ${2} | ${'returns 400 if projectId is missing'} | ${{}}                        | ${undefined}                                   | ${400}         | ${'Query parameter "projectId" is required'}
      ${3} | ${'returns 500 on supabase error'}       | ${{ projectId: 'projErr' }}  | ${{ error: { message: 'Supabase exploded' } }} | ${500}         | ${'Supabase error: Supabase exploded'}
      ${4} | ${'returns 404 if project not found'}    | ${{ projectId: 'notfound' }} | ${{ data: null }}                              | ${404}         | ${'Project not found'}
    `('($case) $desc', async ({ query, supabaseResult, expectedStatus, expectedMessage }) => {
      const mockMaybeSingle = jest.fn().mockResolvedValue(supabaseResult)
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      })

      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      await getHistogramData(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
    })
  })

  describe('getOptionAnalysis', () => {
    it.each`
      case | desc                                    | query                     | supabaseResult                                | expectedStatus | expectedMessage                               | expectedData
      ${1} | ${'returns 200 with option analysis'}   | ${{ optionId: 'opt123' }} | ${{ data: { id: 'opt123', content: 'A' } }}   | ${200}         | ${'Specific question analysis retrieved'}     | ${{ id: 'opt123', content: 'A' }}
      ${2} | ${'returns 400 if optionId is missing'} | ${{}}                     | ${undefined}                                  | ${400}         | ${'Query parameters "optionId" are required'} | ${undefined}
      ${3} | ${'returns 500 on supabase error'}      | ${{ optionId: 'fail' }}   | ${{ error: { message: 'Option DB failed' } }} | ${500}         | ${'Supabase error: Option DB failed'}         | ${undefined}
      ${4} | ${'returns 404 if option not found'} | ${{ optionId: 'notfound' }} | ${{
  data: null,
}} | ${404} | ${'Option not found'} | ${undefined}
    `('($case) $desc', async ({ query, supabaseResult, expectedStatus, expectedMessage, expectedData }) => {
      const mockMaybeSingle = jest.fn().mockResolvedValue(supabaseResult)
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        returns: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      })

      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      await getOptionAnalysis(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)

      if (expectedData !== undefined) {
        expect(json.data).toEqual(expectedData)
      }
    })
  })

  describe('getAllQuestionAnalysis', () => {
    it.each`
      case | desc                                         | query                     | examResult                                                                | questionResult                             | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with question analysis'}      | ${{ projectId: 'proj1' }} | ${{ data: { exam_id: 'exam1' } }}                                         | ${{ data: [{ id: 'q1', content: 'Q1' }] }} | ${200}         | ${'All question analyses retrieved'}
      ${2} | ${'returns 400 if projectId is missing'}     | ${{}}                     | ${undefined}                                                              | ${undefined}                               | ${400}         | ${'Query parameter "projectId" is required'}
      ${3} | ${'returns 500 on exam supabase error'}      | ${{ projectId: 'proj2' }} | ${{ error: { message: 'exam fail' } }}                                    | ${undefined}                               | ${404}         | ${'Exam not found'}
      ${4} | ${'returns 404 if exam not found'}           | ${{ projectId: 'proj3' }} | ${{ data: null }}                                                         | ${undefined}                               | ${404}         | ${'Exam not found'}
      ${5} | ${'returns 500 on questions supabase error'} | ${{ projectId: 'proj4' }} | ${{ data: { exam_id: 'examX' } }}                                         | ${{ error: { message: 'question fail' } }} | ${500}         | ${'Supabase error: question fail'}
      ${6} | ${'returns 404 if questions not found'}      | ${{ projectId: 'proj5' }} | ${{ data: { exam_id: 'examY' } }}                                         | ${{ data: null }}                          | ${404}         | ${'Questions not found'}
      ${7} | ${'returns 500 if exam error exists'}        | ${{ projectId: 'proj6' }} | ${{ data: { exam_id: 'examZ' }, error: { message: 'exam query error' } }} | ${undefined}                               | ${500}         | ${'Supabase error: exam query error'}
    `('($case) $desc', async ({ query, examResult, questionResult, expectedStatus, expectedMessage }) => {
      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      if (!query.projectId) {
        await getAllQuestionAnalysis(req, res)
        expect(res.statusCode).toBe(expectedStatus)
        expect(res._getJSONData().message).toBe(expectedMessage)
        return
      }

      // Mock the first Supabase call (exam_analysis)
      const examCall = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(examResult),
      }
      ;(supabase.from as jest.Mock).mockImplementationOnce(() => examCall)

      // Only mock the second Supabase call if exam_id is present
      if (examResult?.data?.exam_id) {
        const questionCall = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          returns: jest.fn().mockResolvedValue(questionResult),
        }
        ;(supabase.from as jest.Mock).mockImplementationOnce(() => questionCall)
      }

      await getAllQuestionAnalysis(req, res)
      const json = res._getJSONData()

      expect(res.statusCode).toBe(expectedStatus)
      expect(json.message).toBe(expectedMessage)
    })
  })

  describe('getQuestionAnalysis', () => {
    it.each`
      case | desc                                      | query                         | supabaseResult                                 | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with question data'}       | ${{ questionId: 'q123' }}     | ${{ data: { id: 'q123', content: 'Q?' } }}     | ${500}         | ${'An unexpected error occurred.'}
      ${2} | ${'returns 400 if questionId is missing'} | ${{}}                         | ${undefined}                                   | ${400}         | ${'Query parameters "questionId" are required'}
      ${3} | ${'returns 500 on supabase error'}        | ${{ questionId: 'fail' }}     | ${{ error: { message: 'Supabase exploded' } }} | ${500}         | ${'Supabase error: Supabase exploded'}
      ${4} | ${'returns 404 if question not found'}    | ${{ questionId: 'notfound' }} | ${{ data: null }}                              | ${404}         | ${'Question not found'}
    `('($case) $desc', async ({ query, supabaseResult, expectedStatus, expectedMessage }) => {
      const mockMaybeSingle = jest.fn().mockResolvedValue(supabaseResult)
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        returns: jest.fn().mockReturnThis(),
        maybeSingle: mockMaybeSingle,
      })

      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      await getQuestionAnalysis(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
      if (expectedStatus === 200) {
        expect(json.data).toEqual(supabaseResult.data)
      }
    })
  })

  describe('getOptionsAnalysis', () => {
    it.each`
      case | desc                                      | query                         | supabaseResult                                   | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with options analysis'}    | ${{ questionId: 'q456' }}     | ${{ data: [{ id: 'o1', content: 'Option A' }] }} | ${200}         | ${'Specific question analysis retrieved'}
      ${2} | ${'returns 400 if questionId is missing'} | ${{}}                         | ${undefined}                                     | ${400}         | ${'Query parameters "questionId" are required'}
      ${3} | ${'returns 500 on supabase error'}        | ${{ questionId: 'fail' }}     | ${{ error: { message: 'Options DB failed' } }}   | ${500}         | ${'Supabase error: Options DB failed'}
      ${4} | ${'returns 404 if no options found'}      | ${{ questionId: 'notfound' }} | ${{ data: null }}                                | ${404}         | ${'Exam not found'}
    `('($case) $desc', async ({ query, supabaseResult, expectedStatus, expectedMessage }) => {
      const mockReturns = jest.fn().mockResolvedValue(supabaseResult)
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        returns: mockReturns,
      })

      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()

      await getOptionsAnalysis(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
      if (expectedStatus === 200) {
        expect(json.data).toEqual(supabaseResult.data)
      }
    })
  })
  describe('getStudentResult', () => {
    it.each`
      case | query                      | supabaseResult                                                                                                                                                         | expectedStatus | expectedMessage
      ${1} | ${{ studentExamId: 's1' }} | ${{ data: { id: 's1', first_name: 'A', last_name: 'B', total_score: 5, ability: 0.5, student_id: 'stu1', exam_id: 'ex1', grade: 'A', middle_name: '', answers: [] } }} | ${200}         | ${'Student result retrieved'}
      ${2} | ${{}}                      | ${undefined}                                                                                                                                                           | ${400}         | ${'Query parameter "studentExamId" is required'}
      ${3} | ${{ studentExamId: 's2' }} | ${{ error: { message: 'RPC failed' } }}                                                                                                                                | ${500}         | ${'Supabase RPC error: RPC failed'}
      ${4} | ${{ studentExamId: 's3' }} | ${{ data: null }}                                                                                                                                                      | ${404}         | ${'No student result found'}
    `('($case) handles getStudentResult', async ({ query, supabaseResult, expectedStatus, expectedMessage }) => {
      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        returns: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(supabaseResult),
      })

      await getStudentResult(req, res)
      const json = res._getJSONData()
      expect(res.statusCode).toBe(expectedStatus)
      expect(json.message).toBe(expectedMessage)
    })
  })

  describe('getStudentsByProjectId', () => {
    it.each`
      case | query                    | rpcResult                              | expectedStatus | expectedMessage
      ${1} | ${{ projectId: 'p1' }}   | ${{ data: [{ student_id: 's1' }] }}    | ${200}         | ${'Students retrieved successfully'}
      ${2} | ${{}}                    | ${undefined}                           | ${400}         | ${'Query parameter "projectId" is required'}
      ${3} | ${{ projectId: 'fail' }} | ${{ error: { message: 'RPC error' } }} | ${500}         | ${'Supabase error: RPC error'}
    `('($case) handles getStudentsByProjectId', async ({ query, rpcResult, expectedStatus, expectedMessage }) => {
      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()
      ;(supabase.rpc as jest.Mock).mockResolvedValue(rpcResult)

      await getStudentsByProjectId(req, res)
      const json = res._getJSONData()
      expect(res.statusCode).toBe(expectedStatus)
      expect(json.message).toBe(expectedMessage)
    })
  })

  describe('getRaschAnalysis', () => {
    it.each`
      case | query                     | rpcResult                               | expectedStatus | expectedMessage
      ${1} | ${{ projectId: 'p1' }}    | ${{ data: [{ item: 'i1' }] }}           | ${200}         | ${'Rasch analysis retrieved successfully'}
      ${2} | ${{}}                     | ${undefined}                            | ${400}         | ${'Query parameter "projectId" is required'}
      ${3} | ${{ projectId: 'fail' }}  | ${{ error: { message: 'RPC failed' } }} | ${500}         | ${'Supabase RPC error: RPC failed'}
      ${4} | ${{ projectId: 'empty' }} | ${{ data: [] }}                         | ${404}         | ${'No Rasch analysis found for this project'}
    `('($case) handles getRaschAnalysis', async ({ query, rpcResult, expectedStatus, expectedMessage }) => {
      const req = httpMocks.createRequest({ query })
      const res = httpMocks.createResponse()
      ;(supabase.rpc as jest.Mock).mockResolvedValue(rpcResult)

      await getRaschAnalysis(req, res)
      const json = res._getJSONData()
      expect(res.statusCode).toBe(expectedStatus)
      expect(json.message).toBe(expectedMessage)
    })
  })
})
