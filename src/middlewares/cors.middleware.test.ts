import corsMiddleware from '@/middlewares/cors.middleware'
import { Request, Response } from 'express'
import httpMocks from 'node-mocks-http'

describe('corsMiddleware', () => {
  const runMiddleware = (req: Request, res: Response) => {
    return new Promise<void>((resolve, reject) => {
      corsMiddleware(req, res, (err: Error) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  it.each`
    case | origin                               | shouldPass
    ${1} | ${'https://lifeistoolong.id.vn'}     | ${true}
    ${2} | ${'https://www.lifeistoolong.id.vn'} | ${true}
    ${3} | ${'http://localhost:5173'}           | ${true}
    ${4} | ${'http://localhost:4173'}           | ${true}
    ${5} | ${'http://notallowed.com'}           | ${false}
    ${6} | ${undefined}                         | ${true}
  `('($case) handles origin: $origin', async ({ origin, shouldPass }) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      headers: origin ? { origin } : {},
    })
    const res = httpMocks.createResponse()

    const result = runMiddleware(req, res)

    if (shouldPass) {
      await expect(result).resolves.toBeUndefined()
    } else {
      await expect(result).rejects.toThrow('Not allowed by CORS')
    }
  })
})
