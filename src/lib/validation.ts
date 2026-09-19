/**
 * Form doğrulama + yazarken temizleme katmanı (Türkçe karakter destekli).
 * login / register / profile formları bu modülü kullanır.
 */

/* ------------------------- Yazarken temizleyiciler ------------------------- */

/** Ad Soyad: rakam ve sembolleri düşürür; yalnızca harf, boşluk, ' . - kalır */
export function sanitizeName(input: string): string {
  return input
    .replace(/[^\p{L}\s'.-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 60)
}

/** E-posta: boşluk ve geçersiz işaretleri düşürür */
export function sanitizeEmail(input: string): string {
  return input
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9@._+-]/g, '')
    .slice(0, 80)
}

/** Yaş/Boy/Kilo vb. sayısal alanlar: yalnızca rakam */
export function sanitizeDigits(input: string): string {
  return input.replace(/\D/g, '')
}

/** Konum: yalnızca harf, boşluk, , . - / */
export function sanitizeLocation(input: string): string {
  return input
    .replace(/[^\p{L}\s,./-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 60)
}

/** Telefon: rakamları ayıklayıp 0555 123 45 67 biçiminde biçimlendirir */
export function formatPhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length > 10) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 9), digits.slice(9, 11)]
  return ('0' + parts.filter(Boolean).join(' ')).trim()
}

/** Lisans no: büyük harf + rakam + tire */
export function sanitizeLicense(input: string): string {
  return input
    .toLocaleUpperCase('tr-TR')
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 16)
}

/* ------------------------------ Doğrulayıcılar ----------------------------- */

type FieldError = string | null

export function validateName(value: string): FieldError {
  const v = value.trim()
  if (!v) return 'Ad soyad zorunludur.'
  if (v.length < 3) return 'Ad soyad en az 3 karakter olmalıdır.'
  const words = v.split(/\s+/).filter((w) => w.length >= 2)
  if (words.length < 2) return 'Lütfen adınızı ve soyadınızı birlikte girin (örn. Ahmet Yılmaz).'
  return null
}

export function validateEmail(value: string): FieldError {
  const v = value.trim()
  if (!v) return 'E-posta zorunludur.'
  if (!v.includes('@')) return 'E-posta adresi "@" işareti içermelidir (örn. ad@alanadi.com).'
  const [local = '', domain = ''] = v.split('@')
  if (!local) return '"@" işaretinden önce bir kullanıcı adı yazmalısınız.'
  if (!domain) return '"@" işaretinden sonra bir alan adı yazmalısınız (örn. gmail.com).'
  if (!/^[A-Za-z0-9._%+-]+$/.test(local)) return 'E-posta kullanıcı adı geçersiz karakterler içeriyor.'
  if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/.test(domain)) return 'E-posta alan adı geçersiz (örn. gmail.com).'
  if (!/\.[A-Za-z]{2,}$/.test(domain)) return 'E-posta alan adı ".com" gibi bir uzantı ile bitmelidir.'
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return 'E-posta adresi nokta ile başlayamaz, bitemez veya üst üste nokta içeremez.'
  }
  return null
}

export function validatePhone(value: string): FieldError {
  const digits = value.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '')
  if (!digits) return 'Telefon numarası zorunludur.'
  if (digits.length !== 10) return `Telefon numarası tam 10 hane olmalıdır (şu an ${digits.length}).`
  if (!/^5/.test(digits)) return 'Telefon numarası 5 ile başlamalıdır (örn. 0555 123 45 67).'
  return null
}

export function validateLocation(value: string): FieldError {
  const v = value.trim()
  if (!v) return 'Konum zorunludur.'
  if (v.length < 3) return 'Konum en az 3 karakter olmalıdır.'
  if (!/\p{L}/u.test(v)) return 'Konum en az bir harf içermelidir.'
  return null
}

export function validateHeight(value: string): FieldError {
  if (!value) return 'Boy zorunludur.'
  const n = Number(value)
  if (!Number.isFinite(n) || n < 100 || n > 250) return 'Boy 100 - 250 cm aralığında olmalıdır.'
  return null
}

export function validateWeight(value: string): FieldError {
  if (!value) return 'Kilo zorunludur.'
  const n = Number(value)
  if (!Number.isFinite(n) || n < 30 || n > 300) return 'Kilo 30 - 300 kg aralığında olmalıdır.'
  return null
}

export function validateAge(value: string): FieldError {
  if (!value) return 'Yaş zorunludur.'
  const n = Number(value)
  if (!Number.isFinite(n) || n < 10 || n > 120) return 'Yaş 10 - 120 aralığında olmalıdır.'
  return null
}

export function validatePassword(value: string): FieldError {
  if (!value) return 'Şifre zorunludur.'
  if (value.length < 6) return 'Şifre en az 6 karakter olmalıdır.'
  if (!/\p{L}/u.test(value)) return 'Şifre en az bir harf içermelidir.'
  if (!/\d/.test(value)) return 'Şifre en az bir rakam içermelidir.'
  return null
}

export function validateLicenseNo(value: string): FieldError {
  if (!value) return 'Lisans numarası zorunludur.'
  if (value.length < 4) return 'Lisans numarası en az 4 karakter olmalıdır.'
  return null
}

/* --------------------------- Toplu form doğrulama -------------------------- */

export interface PersonalInfoInput {
  name: string
  email: string
  phone: string
  location?: string
  height?: string
  weight?: string
  age?: string
}

export function validatePersonalInfo(input: PersonalInfoInput): Record<string, string> {
  const errors: Record<string, string> = {}
  const nameError = validateName(input.name)
  if (nameError) errors.name = nameError
  const emailError = validateEmail(input.email)
  if (emailError) errors.email = emailError
  const phoneError = validatePhone(input.phone)
  if (phoneError) errors.phone = phoneError
  if (input.location !== undefined) {
    const err = validateLocation(input.location)
    if (err) errors.location = err
  }
  if (input.height !== undefined && input.height !== '') {
    const err = validateHeight(input.height)
    if (err) errors.height = err
  }
  if (input.weight !== undefined && input.weight !== '') {
    const err = validateWeight(input.weight)
    if (err) errors.weight = err
  }
  if (input.age !== undefined && input.age !== '') {
    const err = validateAge(input.age)
    if (err) errors.age = err
  }
  return errors
}
