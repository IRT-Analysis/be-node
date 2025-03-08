import { ApiResponse } from '@/types/response_data.type'
import { UserType } from '@/types/user.type'

export type ProjectType = {
  id: string
  name: string
  description: string | ''
}

// ----------------------------------------------

export type MyProfileResType = ApiResponse<UserType>

// ----------------------------------------------

export type MyProjectsReqType = {
  userId: UserType['id']
}

export type MyProjectsResType = ApiResponse<ProjectType[]>
