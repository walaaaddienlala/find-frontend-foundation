import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

import { ChatWidget } from '@/components/chat/chat-widget'
import { SiteChrome } from '@/components/layout/site-chrome'
import { siteConfig } from '@/lib/site-config'

import './globals.css'

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — From opportunity to outcome`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fbfbf8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} bg-background`}
    >
      <body className="flex min-h-dvh flex-col">
        <SiteChrome>{children}</SiteChrome>

        {process.env.NEXT_PUBLIC_ENABLE_CHATBOT === 'true' && <ChatWidget />}

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}