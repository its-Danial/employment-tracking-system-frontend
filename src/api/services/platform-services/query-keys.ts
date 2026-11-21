const all = ['platform'] as const

export default {
  all,
  tenants: () => [...all, 'tenants'] as const,
} as const
