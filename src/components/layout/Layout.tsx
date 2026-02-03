import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-500" />
        <div className="bg-orb absolute top-1/2 -right-64 w-[500px] h-[500px] bg-cyan-500" />
      </div>

      <Header />
      <main className="flex-1 relative z-10 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
