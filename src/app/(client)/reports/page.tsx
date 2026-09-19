import { PagePlaceholder } from '@/components/layout/page-placeholder'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Raporlar"
      description="Onaylı analiz raporları ve PDF çıktıları burada biriktirilecek."
      icon={FileText}
    />
  )
}
