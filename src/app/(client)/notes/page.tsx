'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Save, User, FileText, Calendar } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { CLIENTS } from '@/lib/clients-data'

interface Note {
  id: string
  clientId: string
  date: string
  title: string
  content: string
}

const NOTES_KEY = 'posturapp.physio-notes'

function readNotes(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(NOTES_KEY) ?? '[]') as Note[]
  } catch {
    return []
  }
}

function writeNotes(notes: Note[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
  } catch {
    /* yoksay */
  }
}

/**
 * Fizyoterapist / Klinik Notlar — danışan gelişimin hakkında klinik notlar düşme
 * ve ilerleme eğrisini değerlendirme alanıdır.
 */
export default function NotesPage() {
  const [selectedId, setSelectedId] = useState(CLIENTS[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)

  const selected = CLIENTS.find((c) => c.id === selectedId)
  const clientNotes = selectedId ? readNotes().filter((n) => n.clientId === selectedId) : []

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    const notes = readNotes()
    const note: Note = {
      id: `note-${Date.now()}`,
      clientId: selectedId,
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
    }
    writeNotes([note, ...notes])
    setTitle('')
    setContent('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!selected) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Klinik Notlar</h1>
        <p className="text-sm text-muted-foreground">Kayıtlı danışan bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Klinik Notlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Danışan gelişimin hakkında klinik notlar düş ve ilerleme eğrisini değerlendir</p>
      </div>

      <Panel title="Danışan Seç" description="Not eklemek için danışan seçin">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        >
          {CLIENTS.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
          ))}
        </select>
      </Panel>

      <Panel title="Yeni Klinik Notu" description={` ${selected.name} `}>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not başlığı (örn. 14 Eylül Klinik Değerlendirme)"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Klinik değerlendirme, ölçülüm sonuçları, egzersiz önerileri..."
            rows={6}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {saved && <p className="text-xs text-chart-3">Not kaydedildi.</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden /> Kaydet
          </button>
        </div>
      </Panel>

      <Panel title="İlerleme Eğrisi" description={`${selected.name} — skor gelişimi`}>
        <div className="flex h-36 items-end gap-3">
          {selected.progress.map((p) => (
            <div key={p.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-sm font-semibold text-primary">{p.score}</span>
              <div className="w-full rounded-t-lg bg-primary/20" style={{ height: `${p.score}%` }} />
              <span className="text-[10px] text-muted-foreground">{p.month}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Geçmiş Notlar" description={`${clientNotes.length} kayıt`}>
        <div className="space-y-3">
          {clientNotes.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz klinik not kaydı yok.</p>
          )}
          {clientNotes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{note.title}</p>
                <span className="text-[10px] text-muted-foreground">{new Date(note.date).toLocaleDateString('tr-TR')}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
