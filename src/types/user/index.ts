import type { ISODateString, UUID } from '@/types'

export interface User {
  id: UUID
  fullName: string
  email: string
  createdAt: ISODateString
  updatedAt: ISODateString
}
