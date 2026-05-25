import './globals.css'

export const metadata = {
  title: 'Renovation Tracker',
  description: 'Track en plan je huisrenovaties',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
