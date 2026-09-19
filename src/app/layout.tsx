import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { RoleProvider } from '@/lib/role-context'
import { ThemeProvider, themeInitScript } from '@/lib/theme-context'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'PosturApp — AI Postür ve Sağlık Analiz Platformu',
  description:
    'Yapay zeka destekli postür ve sağlık analiz platformu. Canlı tarama, skor takibi ve kişiselleştirilmiş egzersiz programları.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Varsayılan tema aydınlık; koyu tema yalnızca ayarlardan seçilirse eklenir.
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        {/* Tema ve oturum bilgisi tüm sayfa/bileşenler tarafından paylaşılır */}
        <ThemeProvider>
          <RoleProvider>{children}</RoleProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}