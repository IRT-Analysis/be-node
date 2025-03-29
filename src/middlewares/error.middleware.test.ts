import { invalidPathHandler, errorHandler } from '@/middlewares/error.middleware'
import { AppError } from '@/utils/errorHandler'
import httpMocks from 'node-mocks-http'

describe('error middleware', () => {
  describe('invalidPathHandler', () => {
    it('should return 404 with "Path not found"', () => {
      const req = httpMocks.createRequest()
      const res = httpMocks.createResponse()
      const next = jest.fn()

      invalidPathHandler(req, res, next)
      expect(res.statusCode).toBe(404)
      const json = res._getJSONData()
      expect(json.message).toBe('Path not found')
      expect(json.code).toBe(404)
    })
  })

  describe('errorHandler', () => {
    it.each`
      case | desc                           | error                                | expectedStatus | expectedMessage            | expectedCode
      ${1} | ${'handles AppError'}          | ${new AppError('Custom error', 403)} | ${500}         | ${'Custom error'}          | ${403}
      ${2} | ${'handles generic error'}     | ${{ message: 'Something broke' }}    | ${500}         | ${'Something broke'}       | ${500}
      ${3} | ${'handles error without msg'} | ${{}}                                | ${500}         | ${'Internal Server Error'} | ${500}
    `('($case) $desc', ({ error, expectedStatus, expectedMessage, expectedCode }) => {
      const req = httpMocks.createRequest()
      const res = httpMocks.createResponse()
      const next = jest.fn()

      errorHandler(error as AppError, req, res, next)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
      expect(json.code).toBe(expectedCode)
    })
  })
})
