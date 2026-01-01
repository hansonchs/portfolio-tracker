import type { Metadata } from "next"
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css"
import { Toaster } from "sonner"
import VercelAnalytics from "@/components/VercelAnalytics"

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
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-background">
          <VercelAnalytics />
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Portfolio Tracker</h1>
                <div className="flex items-center gap-4">
                  <div className="flex gap-4">
                    <a href="/" className="text-sm hover:underline">Dashboard</a>
                    <a href="/positions" className="text-sm hover:underline">Positions</a>
                    <a href="/settings" className="text-sm hover:underline">Settings</a>
                  </div>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
