import { CalendarDays } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function AppointmentsPage() {
  return (
    <PagePlaceholder
      title="Randevular"
      description="Takvimini yönet ve danışan seanslarını planla."
      icon={CalendarDays}
    />
  )
}
