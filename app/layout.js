import './globals.css'
import './forms.css'

export const metadata = {
  title: 'Crescer Bem — alimentação saudável em família',
  description: 'Planeje refeições equilibradas com o que você já tem em casa.'
}

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
