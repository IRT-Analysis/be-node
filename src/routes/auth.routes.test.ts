import request from 'supertest'
import app from '..'
import { supabase } from '@/utils/supabaseClient'

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

describe('POST /api/auth', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe.each`
    case | endpoint      | body                                             | mockResult                                                  | expectedStatus | expectedMessage
    ${1} | ${'/signin'}  | ${{ email: 'user@mail.com', password: 'pass' }}  | ${{ data: { session: { access_token: 'token' } } }}         | ${200}         | ${'User signed in successfully'}
    ${2} | ${'/signup'}  | ${{ email: 'new@mail.com', password: '123456' }} | ${{ data: { user: { id: '123', email: 'new@mail.com' } } }} | ${200}         | ${'User signed up successfully'}
    ${3} | ${'/signout'} | ${{}}                                            | ${{ error: null }}                                          | ${200}         | ${'User signed out successfully'}
  `('($case) $endpoint success', ({ endpoint, body, mockResult, expectedStatus, expectedMessage }) => {
    it(`should return ${expectedStatus} with success message`, async () => {
      if (endpoint === '/signin') {
        ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResult)
      } else if (endpoint === '/signup') {
        ;(supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResult)
      } else {
        ;(supabase.auth.signOut as jest.Mock).mockResolvedValue(mockResult)
      }

      const res = await request(app).post(`/api/auth${endpoint}`).send(body)

      expect(res.status).toBe(expectedStatus)
      expect(res.body.message).toBe(expectedMessage)
    })
  })

  describe.each`
    case | endpoint     | body                           | expectedStatus | expectedMessage
    ${1} | ${'/signin'} | ${{ email: '', password: '' }} | ${400}         | ${'Email and password are required'}
    ${2} | ${'/signup'} | ${{ email: '', password: '' }} | ${400}         | ${'Email and password are required'}
  `('($case) $endpoint validation errors', ({ endpoint, body, expectedStatus, expectedMessage }) => {
    it(`should return ${expectedStatus} when input is invalid`, async () => {
      const res = await request(app).post(`/api/auth${endpoint}`).send(body)

      expect(res.status).toBe(expectedStatus)
      expect(res.body.message).toBe(expectedMessage)
    })
  })

  it('should return 400 when signIn fails due to Supabase error', async () => {
    ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    })

    const res = await request(app).post('/api/auth/signin').send({
      email: 'test@example.com',
      password: 'wrongpass',
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid credentials')
  }) // <-- increase timeout to 10 seconds

  it('should return 400 when signUp fails due to Supabase error', async () => {
    ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Email already exists' },
    })

    const res = await request(app).post('/api/auth/signup').send({ email: 'existing@mail.com', password: '123456' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Email already exists')
  })

  it('should return 400 when signOut fails due to Supabase error', async () => {
    ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
      error: { message: 'Sign out failed' },
    })

    const res = await request(app).post('/api/auth/signout')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Sign out failed')
  })
})
