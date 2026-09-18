import { FileText } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Raporlar"
      description="Danışan ilerleme raporlarını oluştur ve dışa aktar."
      icon={FileText}
    />
  )
}
