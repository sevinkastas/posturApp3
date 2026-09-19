import { AppShell } from '@/components/layout/app-shell'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export default function RootDashboardPage() {
  // Not: Giriş yapmış kullanıcının tipine (client/physio) göre
  // yönlendirme (redirect) veya farklı arayüz (<ClientDashboard /> / <PhysioDashboard />)
  // işlemleri burada yapılabilir. Şu an için her ikisinde de olan ortak bileşeni yüklüyoruz.
  // Kök sayfa hiçbir route-group layout'unun altında olmadığı için AppShell'i burada
  // doğrudan sarmalıyoruz; sarmalanmazsa Sidebar/Navbar/BottomBar hiç render edilmez.
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  )
}

