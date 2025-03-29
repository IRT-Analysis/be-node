import logger, { requestLoggerStream } from '@/utils/logger'
import request from 'supertest'
import app from '..'
describe('requestLoggerStream', () => {
  it('should log structured data to logger.info', () => {
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => logger)

    const msg = 'GET /health 200 3.45 ms\n'
    requestLoggerStream.write(msg)

    expect(spy).toHaveBeenCalled()

    const logged = JSON.parse(spy.mock.calls[0][0] as unknown as string)
    expect(logged).toEqual({
      method: 'GET',
      url: '/health',
      status: '200',
      responseTime: '3.45',
    })

    spy.mockRestore()
  })
})

describe('loggerMiddleware', () => {
  it('should trigger logger.info when hitting any route', async () => {
    const spy = jest.spyOn(logger, 'info').mockImplementation(() => logger)

    const res = await request(app).get('/api/ping') // or whatever route you defined
    expect(res.status).toBe(200)

    expect(spy).toHaveBeenCalled()
    const loggedMessage = spy.mock.calls[0][0] as unknown as string

    const parsed = JSON.parse(loggedMessage)
    expect(parsed).toMatchObject({
      method: 'GET',
      url: '/api/ping',
      status: '200',
    })

    spy.mockRestore()
  })
})
