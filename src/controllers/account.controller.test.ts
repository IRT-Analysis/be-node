import { getMyProfile, getMyProjects } from '@/controllers/account.controller'
import { supabase } from '@/utils/supabaseClient'
import httpMocks from 'node-mocks-http'

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

describe('Account Controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // -------------------------------
  // 🔹 getMyProfile tests
  // -------------------------------
  describe('getMyProfile', () => {
    const mockUser = { id: '123', email: 'test@example.com' }

    it.each`
      case | desc                              | authToken          | supabaseResponse                | expectedStatus | expectedMessage                  | expectedData
      ${1} | ${'returns 200 with valid user'}  | ${'valid_token'}   | ${{ data: { user: mockUser } }} | ${200}         | ${'User retrieved successfully'} | ${mockUser}
      ${2} | ${'returns 401 if no user found'} | ${'invalid_token'} | ${{ data: { user: null } }}     | ${401}         | ${'User not found'}              | ${undefined}
    `('($case) $desc', async ({ authToken, supabaseResponse, expectedStatus, expectedMessage, expectedData }) => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue(supabaseResponse)

      const req = httpMocks.createRequest({
        cookies: { auth_token: authToken },
      })
      const res = httpMocks.createResponse()

      await getMyProfile(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
      if (expectedData !== undefined) {
        expect(json.data).toEqual(expectedData)
      }
    })
  })

  // -------------------------------
  // 🔹 getMyProjects tests
  // -------------------------------
  describe('getMyProjects', () => {
    const mockProjects = [
      {
        id: 1,
        user_id: '123',
        name: 'Project A',
        total_questions: 10,
        total_students: 20,
        total_options: 5,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ]

    it.each`
      case | desc                                | user             | supabaseResult                           | expectedStatus | expectedMessage                      | expectedData
      ${1} | ${'returns 200 with user projects'} | ${{ id: '123' }} | ${{ data: mockProjects }}                | ${200}         | ${'Projects retrieved successfully'} | ${mockProjects}
      ${2} | ${'returns 400 on supabase error'}  | ${{ id: '123' }} | ${{ error: { message: 'Query error' } }} | ${400}         | ${'Query error'}                     | ${undefined}
      ${3} | ${'returns 401 if no user'}         | ${undefined}     | ${undefined}                             | ${401}         | ${'User not found'}                  | ${undefined}
    `('($case) $desc', async ({ user, supabaseResult, expectedStatus, expectedMessage, expectedData }) => {
      if (user && supabaseResult) {
        ;(supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue(supabaseResult),
        })
      }

      const req = httpMocks.createRequest({ user })
      const res = httpMocks.createResponse()

      await getMyProjects(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
      if (expectedData !== undefined) {
        expect(json.data).toEqual(expectedData)
      }
    })
  })
})
