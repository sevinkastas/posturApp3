import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { CalendarDays } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <PagePlaceholder
      title="Randevular"
      description="Kontrol ve görüşme takviminiz — yaklaşan randevular burada listelenecek."
      icon={CalendarDays}
    />
  )
}
