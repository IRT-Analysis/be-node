import { signIn, signOut, signUp } from '@/controllers/auth.controller'
import { supabase } from '@/utils/supabaseClient'
import httpMocks from 'node-mocks-http'

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // ---------------------------------
  // 🔐 signIn
  // ---------------------------------
  describe('signIn', () => {
    it.each`
      case | desc                                       | body                                            | supabaseRes                                                                            | expectedStatus | expectedMessage
      ${1} | ${'returns 200 with valid credentials'}    | ${{ email: 'test@mail.com', password: '1234' }} | ${{ data: { session: { access_token: 'abc123' } }, error: null }}                      | ${200}         | ${'User signed in successfully'}
      ${2} | ${'returns 400 if missing fields'}         | ${{ email: '', password: '' }}                  | ${undefined}                                                                           | ${400}         | ${'Email and password are required'}
      ${3} | ${'returns 400 if Supabase error present'} | ${{ email: 'fail@mail.com', password: '1234' }} | ${{ data: { session: { access_token: 'xyz' } }, error: { message: 'Invalid login' } }} | ${400}         | ${'Invalid login'}
    `('($case) $desc', async ({ body, supabaseRes, expectedStatus, expectedMessage }) => {
      if (supabaseRes) {
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(supabaseRes)
      }

      const req = httpMocks.createRequest({ body })
      const res = httpMocks.createResponse()
      res.cookie = jest.fn()

      await signIn(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
    })
  })

  // ---------------------------------
  // 🆕 signUp
  // ---------------------------------
  describe('signUp', () => {
    it.each`
      case | desc                                       | body                                                       | supabaseRes                                       | expectedStatus | expectedMessage
      ${1} | ${'returns 200 on successful sign up'}     | ${{ email: 'new@mail.com', password: '1234', option: {} }} | ${{ data: { user: { id: 'u1' } }, error: null }}  | ${200}         | ${'User signed up successfully'}
      ${2} | ${'returns 400 if email/password missing'} | ${{ email: '', password: '', option: {} }}                 | ${undefined}                                      | ${400}         | ${'Email and password are required'}
      ${3} | ${'returns 400 if Supabase error occurs'}  | ${{ email: 'err@mail.com', password: '1234', option: {} }} | ${{ error: { message: 'Email already exists' } }} | ${400}         | ${'Email already exists'}
    `('($case) $desc', async ({ body, supabaseRes, expectedStatus, expectedMessage }) => {
      if (supabaseRes) {
        ;(supabase.auth.signUp as jest.Mock).mockResolvedValue(supabaseRes)
      }

      const req = httpMocks.createRequest({ body })
      const res = httpMocks.createResponse()

      await signUp(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
    })
  })

  // ---------------------------------
  // 🚪 signOut
  // ---------------------------------
  describe('signOut', () => {
    it.each`
      case | desc                                    | supabaseRes                                     | expectedStatus | expectedMessage
      ${1} | ${'returns 200 on successful sign out'} | ${{ error: null }}                              | ${200}         | ${'User signed out successfully'}
      ${2} | ${'returns 400 if Supabase error'}      | ${{ error: { message: 'Already signed out' } }} | ${400}         | ${'Already signed out'}
    `('($case) $desc', async ({ supabaseRes, expectedStatus, expectedMessage }) => {
      ;(supabase.auth.signOut as jest.Mock).mockResolvedValue(supabaseRes)

      const req = httpMocks.createRequest()
      const res = httpMocks.createResponse()

      await signOut(req, res)

      expect(res.statusCode).toBe(expectedStatus)
      const json = res._getJSONData()
      expect(json.message).toBe(expectedMessage)
    })
  })
})
