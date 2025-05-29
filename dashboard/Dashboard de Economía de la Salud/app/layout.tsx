import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/ui/nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dashboard de Economía de la Salud",
  description: "Dashboard para análisis económico de servicios hospitalarios",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <MainNav />
            </div>
          </div>
          <main className="flex-1 space-y-4 p-8 pt-6">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
