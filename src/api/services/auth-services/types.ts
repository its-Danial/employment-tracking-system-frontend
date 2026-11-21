// REQUEST
import type { SuccessResponse } from '@/shared/api'
import type { AuthSession, User } from '@/shared/entities'

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
  /** 30 day session instead of 12 hours */
  rememberMe?: boolean
}

// RESPONSE

export type RegisterUserResponse = SuccessResponse<AuthSession>

export type LoginUserResponse = SuccessResponse<AuthSession>

export type CurrentUserResponse = SuccessResponse<User>
