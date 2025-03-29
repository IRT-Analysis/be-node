import { AppError, createError, handleError } from '@/utils/errorHandler'
import httpMocks from 'node-mocks-http'

describe('AppError & createError', () => {
  it('should create an AppError with message, status, and optional details', () => {
    const error = new AppError('Something went wrong', 400, { info: 'bad request' })

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Something went wrong')
    expect(error.status).toBe(400)
    expect(error.error).toEqual({ info: 'bad request' })
  })

  it('createError should return an instance of AppError', () => {
    const err = createError(403, 'Forbidden', { reason: 'unauthorized' })

    expect(err).toBeInstanceOf(AppError)
    expect(err.message).toBe('Forbidden')
    expect(err.status).toBe(403)
    expect(err.error).toEqual({ reason: 'unauthorized' })
  })
})

describe('handleError', () => {
  it.each`
    case | desc                          | error                                                   | expectedStatus | expectedMessage                    | expectedError
    ${1} | ${'handles AppError'}         | ${new AppError('Not found', 404, { path: '/unknown' })} | ${404}         | ${'Not found'}                     | ${{ path: '/unknown' }}
    ${2} | ${'handles Axios error with response'} | ${{
  isAxiosError: true,
  response: {
    data: {
      message: 'Flask error',
      code: 400,
      error: { reason: 'invalid input' },
    },
  },
}} | ${400} | ${'Flask error'} | ${{ reason: 'invalid input' }}
    ${3} | ${'handles generic JS Error'} | ${new Error('Unexpected')}                              | ${500}         | ${'An unexpected error occurred.'} | ${'Error: Unexpected'}
    ${4} | ${'handles unknown string'}   | ${'some string error'}                                  | ${500}         | ${'An unexpected error occurred.'} | ${'some string error'}
  `('($case) $desc', ({ error, expectedStatus, expectedMessage, expectedError }) => {
    const res = httpMocks.createResponse()
    handleError(res, error)

    expect(res.statusCode).toBe(expectedStatus)
    const json = res._getJSONData()
    expect(json.message).toBe(expectedMessage)
    expect(json.code).toBe(expectedStatus)

    if (typeof expectedError === 'object') {
      expect(json.error).toEqual(expectedError)
    } else {
      expect(json.error).toContain(expectedError)
    }
  })
})
