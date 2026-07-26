import type { Metadata } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'
import AuthAwareLayout from '@/components/layout/AuthAwareLayout'

export const metadata: Metadata = {
  title: 'Upnex AI CRM',
  description: 'AI-powered education consulting CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">
        <StoreProvider>
          <AuthAwareLayout>{children}</AuthAwareLayout>
        </StoreProvider>
      </body>
    </html>
  )
}
