import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Oturum yönlendirme katmanı.
 * - Varsayılan: login/register
 * - Oturum yoksa korumalı tüm sayfalar /login'e yönlenir
 * - Oturum varken /login ve /register açılmaz, panele dönülür
 * - /admin/* yalnızca sabit yönetici rolüne açıktır
 * - Uzman (fizyoterapist) sayfaları yalnızca onaylı premium uzmana açıktır
 * - Premium sayfalar (/support) yalnızca ücretli üyeliğe açıktır
 */

const PHYSIO_ONLY = ['/clients', '/reviews', '/notes', '/appointments', '/reports']
const ADMIN_ONLY = ['/admin']
const PREMIUM_ONLY = ['/support']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const role = request.cookies.get('posturapp_role')?.value
  const plan = request.cookies.get('posturapp_plan')?.value
  const hasSession = Boolean(request.cookies.get('posturapp_token')?.value)

  const isAdmin = role === 'admin'
  const isPhysio = role === 'physio' && plan === 'physio-premium'
  const isPremium = plan === 'patient-premium' || plan === 'physio-premium'

  // Oturum yoksa: her şey login'e gider (login/register hariç)
  if (!hasSession) {
    if (path.startsWith('/login') || path.startsWith('/register')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Oturum varsa: auth ekranlarında panele dön
  if (path.startsWith('/login') || path.startsWith('/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Yönetici alanı — yalnızca sabit yönetici
  if (ADMIN_ONLY.some((p) => path.startsWith(p)) && !isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Uzman (klinik) alanı — onaylı premium fizyoterapist veya yönetici
  if (PHYSIO_ONLY.some((p) => path.startsWith(p)) && !isPhysio && !isAdmin) {
    // Onaylı uzman ama uzman paketini satın almamışsa paket sayfasına yönlendir
    return NextResponse.redirect(new URL(role === 'physio' ? '/premium' : '/', request.url))
  }

  // Premium alanı — ücretli üyelik gerektirir
  if (PREMIUM_ONLY.some((p) => path.startsWith(p)) && !isPremium && !isAdmin) {
    return NextResponse.redirect(new URL('/premium', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
}
