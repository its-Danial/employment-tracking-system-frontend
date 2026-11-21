import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AccessControl from '@/components/access/AccessControl.vue'
import type { User } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import type { GrantedPermission } from '@/shared/permissions'
import { useUserStore } from '@/stores/user'
import { mount } from '@vue/test-utils'

vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add: vi.fn() }) }))
vi.mock('@/router', () => ({ default: { replace: vi.fn(), push: vi.fn() } }))

function loginWith(permissions: GrantedPermission[]) {
  const store = useUserStore()
  store.user = { permissions } as User
}

const mountAccessControl = (props: InstanceType<typeof AccessControl>['$props']) =>
  mount(AccessControl, {
    props,
    slots: { default: 'allowed', fallback: 'denied' },
  })

describe('AccessControl', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders content when the user has the permission', () => {
    loginWith([PERMISSIONS.trades.view])
    expect(mountAccessControl({ permission: PERMISSIONS.trades.view }).text()).toBe('allowed')
  })

  it('renders the fallback when the user lacks the permission', () => {
    loginWith([PERMISSIONS.trades.view])
    expect(mountAccessControl({ permission: PERMISSIONS.trades.delete }).text()).toBe('denied')
  })

  it('requires every permission by default and one with match="any"', () => {
    loginWith([PERMISSIONS.trades.view])
    const permission = [PERMISSIONS.trades.view, PERMISSIONS.trades.delete]
    expect(mountAccessControl({ permission }).text()).toBe('denied')
    expect(mountAccessControl({ permission, match: 'any' }).text()).toBe('allowed')
  })

  it('grants everything with the wildcard permission', () => {
    loginWith(['*'])
    expect(mountAccessControl({ permission: PERMISSIONS.users.delete }).text()).toBe('allowed')
  })
})
