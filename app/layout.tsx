import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  description: "Track your stock and options portfolio",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
              <div className="flex gap-4">
                <a href="/" className="text-sm hover:underline">Dashboard</a>
                <a href="/manual" className="text-sm hover:underline">Manual Entry</a>
                <a href="/positions" className="text-sm hover:underline">Positions</a>
                <a href="/settings" className="text-sm hover:underline">Settings</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
