import { ClipboardList } from 'lucide-react'
import { PagePlaceholder } from '@/components/layout/page-placeholder'

export default function ReviewsPage() {
  return (
    <PagePlaceholder
      title="İncelemeler"
      description="AI analizlerini incele, onayla ve klinik notlar ekle."
      icon={ClipboardList}
    />
  )
}
