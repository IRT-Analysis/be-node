export type UserType = {
  id: string
  email: string
  role: string
}

export interface AppMetadata {
  provider: string
  providers: string[]
}

export interface UserMetadata {
  email: string
  email_verified: boolean
  phone_verified: boolean
  sub: string
  username: string
}

export interface AuthMethod {
  method: string
  timestamp: number
}

export interface SupabaseTokenType {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  email: string
  phone: string
  app_metadata: AppMetadata
  user_metadata: UserMetadata
  role: string
  aal: string
  amr: AuthMethod[]
  session_id: string
  is_anonymous: boolean
}
