# Crescer Bem

Assistente gratuito de alimentação saudável para famílias. O aplicativo ajuda responsáveis a combinar alimentos disponíveis em casa, registrar hábitos e organizar informações de crescimento sem incentivar dietas radicais ou substituir acompanhamento profissional.

## Tecnologias

- Next.js e React
- Vinext para publicação em Cloudflare Workers
- Supabase Auth e PostgreSQL
- Row Level Security para isolar os dados de cada família

## Desenvolvimento local

1. Copie `.env.example` para `.env.local`.
2. Preencha a URL e a chave pública do seu projeto Supabase.
3. Execute `npm install`.
4. Execute `npm run dev`.

Use somente uma chave **publishable** no navegador. Nunca coloque `service_role` ou secret keys em variáveis `NEXT_PUBLIC_*`.

## Banco de dados

As migrações estão em `supabase/migrations`. Todas as tabelas expostas possuem RLS e as políticas limitam cada usuário aos próprios registros e aos perfis de crianças vinculados a ele.

## Segurança clínica

As sugestões são educativas. Quantidades clínicas individualizadas devem ser definidas por pediatra ou nutricionista. O produto não deve recomendar jejuns, dietas extremas, medicamentos ou metas rápidas de perda de peso para crianças.
