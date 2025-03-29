import { authMiddleware, AuthenticatedRequest } from '@/middlewares/auth.middleware'
import { supabase } from '@/utils/supabaseClient'
import httpMocks from 'node-mocks-http'

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}))

describe('authMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should attach user to request and call next if token is valid', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'admin',
    }

    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const req = httpMocks.createRequest<AuthenticatedRequest>({
      cookies: { auth_token: 'valid_token' },
    })
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await authMiddleware(req, res, next)

    expect(supabase.auth.getUser).toHaveBeenCalledWith('valid_token')
    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
  })

  it('should return 401 if token is missing', async () => {
    const req = httpMocks.createRequest<AuthenticatedRequest>({ cookies: {} })
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    const json = res._getJSONData()
    expect(json.message).toBe('Unauthorized: Missing token')
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if token is invalid or supabase returns error', async () => {
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid' },
    })

    const req = httpMocks.createRequest<AuthenticatedRequest>({
      cookies: { auth_token: 'invalid_token' },
    })
    const res = httpMocks.createResponse()
    const next = jest.fn()

    await authMiddleware(req, res, next)

    expect(res.statusCode).toBe(401)
    const json = res._getJSONData()
    expect(json.message).toBe('Unauthorized: Invalid token')
    expect(next).not.toHaveBeenCalled()
  })
})
