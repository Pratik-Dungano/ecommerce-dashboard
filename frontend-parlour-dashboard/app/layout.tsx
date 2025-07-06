import "./globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/hooks/useAuth"
import dynamic from 'next/dynamic'

const Toaster = dynamic(
  () => import('@/components/ui/toaster').then((mod) => mod.Toaster),
  { ssr: false }
)

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Parlour Dashboard",
  description: "Manage your parlour business efficiently",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
