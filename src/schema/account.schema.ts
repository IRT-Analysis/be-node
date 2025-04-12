import { ApiResponse } from '@/types/response_data.type'
import { UserType } from '@/types/user.type'
import { User } from '@supabase/supabase-js'

export type ProjectType = {
  created_at: string
  user_id: string
  name: string
  id: string
  total_questions: number
  total_students: number
  total_options: number
  type: string
}

// ----------------------------------------------

export type MyProfileResType = ApiResponse<User>

// ----------------------------------------------

export type MyProjectsReqType = {
  userId: UserType['id']
}

export type MyProjectsResType = ApiResponse<ProjectType[]>
