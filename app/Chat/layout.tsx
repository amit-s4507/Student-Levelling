import { ThemeProvider } from '@/components/theme-provider'
import { ColorToggle } from '@/components/color-toggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main>
      <ThemeProvider>
        <div className="absolute top-5 right-5">
          <ColorToggle />
        </div>
        {children}
      </ThemeProvider>
    </main>
  )
}
