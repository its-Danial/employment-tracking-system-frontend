import api from '@/api'
import endpoints from '@/api/endpoints'
import type {
  CurrentUserResponse,
  LoginUserRequest,
  LoginUserResponse,
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
  async me() {
    return (await api.get<CurrentUserResponse>(endpoints.ME)).data
  },
  async logout() {
    await api.post(endpoints.LOGOUT) // 204 No Content
  },
} as const
