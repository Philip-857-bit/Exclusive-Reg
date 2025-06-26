// app/layout.tsx

import './globals.css'

export const metadata = {
  title: 'Dexclusive Music Organisation',
  description: 'Event registration for the ultimate music conference',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}