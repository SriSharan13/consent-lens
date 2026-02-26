import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CursorGlow from '@/components/CursorGlow'
import ExtensionSync from '@/components/ExtensionSync'
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: 'ConsentLens - Turn Legal Consent into Real-Time Intelligence',
  description:
    'AI-powered consent analysis that transforms complex legal agreements into actionable privacy intelligence in real time.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased relative overflow-x-hidden bg-[#0f0f14]`}
      >
        {/* Base Background */}
        <div className="fixed inset-0 -z-30 bg-[#0f0f14]" />

        {/* Ambient Glow Layers */}
        <div className="fixed inset-0 -z-20 overflow-hidden">
          <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-purple-600 opacity-20 blur-[250px] rounded-full" />
          <div className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-cyan-500 opacity-15 blur-[220px] rounded-full" />
        </div>

        {/* Cursor Glow */}
        <CursorGlow />

        <ExtensionSync />
        {children}
        <Analytics />
      </body>
    </html>
  )
}