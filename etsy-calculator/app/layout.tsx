import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Etsy费用计算器 - Etsy Fee Calculator',
  description: '精准计算Etsy平台所有费用，支持10+国家，提供定价建议',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
