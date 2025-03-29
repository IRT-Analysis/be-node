import request from 'supertest'
import app from '..'
import { supabase } from '@/utils/supabaseClient'

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn(),
    })),
  },
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'authenticated',
}

describe('GET /api/my/profile', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it.each`
    case | desc                                      | cookie                      | authResponse                    | expectedStatus | expectedMessage                  | expectEmail
    ${1} | ${'returns 200 with user data'}           | ${'auth_token=valid_token'} | ${{ data: { user: mockUser } }} | ${200}         | ${'User retrieved successfully'} | ${true}
    ${2} | ${'returns 401 if token missing'}         | ${undefined}                | ${undefined}                    | ${401}         | ${'Unauthorized: Missing token'} | ${false}
    ${3} | ${'returns 401 if Supabase returns null'} | ${'auth_token=invalid'}     | ${{ data: { user: null } }}     | ${401}         | ${'Unauthorized: Invalid token'} | ${false}
  `('($case) $desc', async ({ cookie, authResponse, expectedStatus, expectedMessage, expectEmail }) => {
    if (authResponse !== undefined) {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue(authResponse)
    }

    const req = request(app).get('/api/my/profile')
    if (cookie) req.set('Cookie', [cookie])
    const res = await req

    expect(res.status).toBe(expectedStatus)
    expect(res.body.message).toBe(expectedMessage)
    if (expectEmail) {
      expect(res.body.data).toHaveProperty('email', mockUser.email)
    }
  })
})

describe('GET /api/my/projects', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockProjects = [
    {
      id: 1,
      user_id: mockUser.id,
      name: 'Project A',
      total_questions: 10,
      total_students: 25,
      total_options: 40,
      created_at: '2024-01-01T00:00:00.000Z',
    },
  ]

  it.each`
    case | desc                            | cookie                      | authResponse                    | queryResult                              | expectedStatus | expectedMessage
    ${1} | ${'returns 200 with projects'}  | ${'auth_token=valid_token'} | ${{ data: { user: mockUser } }} | ${{ data: mockProjects }}                | ${200}         | ${'Projects retrieved successfully'}
    ${2} | ${'returns 401 if no token'}    | ${undefined}                | ${undefined}                    | ${undefined}                             | ${401}         | ${'Unauthorized: Missing token'}
    ${3} | ${'returns 400 on query error'} | ${'auth_token=valid_token'} | ${{ data: { user: mockUser } }} | ${{ error: { message: 'Query error' } }} | ${400}         | ${'Query error'}
  `('($case) $desc', async ({ cookie, authResponse, queryResult, expectedStatus, expectedMessage }) => {
    if (authResponse !== undefined) {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue(authResponse)
    }

    if (queryResult !== undefined) {
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(queryResult),
      })
    }

    const req = request(app).get('/api/my/projects')
    if (cookie) req.set('Cookie', [cookie])
    const res = await req

    expect(res.status).toBe(expectedStatus)
    expect(res.body.message).toBe(expectedMessage)
    if (expectedStatus === 200) {
      expect(res.body.data).toEqual(mockProjects)
    }
  })
})
