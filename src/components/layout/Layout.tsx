import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative z-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
