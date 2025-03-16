import { ApiResponse } from '@/types/response_data.type'
import { AuthResponse, AuthTokenResponsePassword } from '@supabase/supabase-js'

export type SignInReqType = {
  email: string
  password: string
}

export type SignInResType = ApiResponse<AuthTokenResponsePassword['data']>

export type SignUpReqType = {
  email: string
  password: string
  option: { username: string }
}

export type SignUpResType = ApiResponse<AuthResponse['data']>

export type SignOutResType = Omit<ApiResponse<null>, 'data'>
