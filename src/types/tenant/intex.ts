export interface Tenant {
  name: string
  subdomain: string
  companyWebsite: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  isActive: boolean
  color: string | null
  logoUrl: string | null
  tagline: string | null
  description: string | null
}
