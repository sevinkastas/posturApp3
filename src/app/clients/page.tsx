import { Users } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function ClientsPage() {
  return (
    <PagePlaceholder
      title="Danışanlar"
      description="Tüm danışanlarını görüntüle, yeni kayıt oluştur ve ilerlemeyi izle."
      icon={Users}
    />
  )
}
