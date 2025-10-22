import api from '@/api'
import endpoints from '@/api/endpoints'
import type {
  LoginUserRequest,
  LoginUserResponse,
  LogoutUserResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from './types'

export default {
  async register(payload: RegisterUserRequest) {
    return (
      await api.post<RegisterUserResponse>(endpoints.REGISTER, payload, {
        attachAccessToken: false,
      })
    ).data
  },
  async login(payload: LoginUserRequest) {
    return (
      await api.post<LoginUserResponse>(endpoints.LOGIN, payload, { attachAccessToken: false })
    ).data
  },
  async logout() {
    return (await api.post<LogoutUserResponse>(endpoints.LOGOUT)).data
  },
} as const
