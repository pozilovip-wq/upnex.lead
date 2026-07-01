import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Upnex AI CRM',
  description: 'AI-powered education consulting CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <StoreProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50">
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  )
}
