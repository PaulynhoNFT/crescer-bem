import './globals.css'

export const metadata = {
  metadataBase: new URL('https://crescer-bem-familia.nutmeg-isle-9944.chatgpt.site'),
  title: 'AI LABS — refeições com o que você tem em casa',
  description: 'Assistente gratuito para famílias planejarem refeições usando os alimentos disponíveis em casa, com segurança e privacidade por padrão.',
  keywords: ['alimentação familiar','planejamento de refeições','despensa','receitas com ingredientes','cardápio familiar'],
  alternates: {canonical: '/'},
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'O que tem em casa pode virar uma boa refeição.',
    description: 'Planeje refeições familiares usando o que você já tem. Gratuito, simples e seguro.',
    siteName: 'AI LABS — alimentação em família',
  },
  twitter: {card: 'summary',title: 'AI LABS — alimentação em família',description: 'Refeições possíveis com o que já existe na sua cozinha.'},
  robots: {index:true,follow:true},
}

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
