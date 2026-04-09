import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

interface LayoutProps {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 py-6 md:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  )
}
