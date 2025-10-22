// REQUEST
import type { ApiSuccessResponse } from '@/api/types'
import type { ISODateString } from '@/types'
import type { User } from '@/types/user'

export interface RegisterUserRequest {
  /**
   * @minLength 3
   * @maxLength 100
   */
  fullName: string
  email: string
  password: string
}

export interface LoginUserRequest {
  email: string
  password: string
}

// RESPONSE

export type RegisterUserResponse = ApiSuccessResponse<{
  user: User
  token: { value: string; expiresAt: ISODateString }
}>

export type LoginUserResponse = ApiSuccessResponse<{
  user: User
  token: { value: string; expiresAt: ISODateString }
}>

export type LogoutUserResponse = ApiSuccessResponse<undefined>
