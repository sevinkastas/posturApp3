export interface RegistryUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'patient' | 'physio'
  plan: 'free' | 'patient-premium' | 'physio-premium'
  /** Onay mekanizması durumu — uzman kayıtları yönetici onayı bekler */
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  licenseNo?: string
  requestedAt: string
  reviewedAt?: string
  reviewNote?: string
}
