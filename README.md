# AI LABS — Assistente de Alimentação Familiar

Produto 100% gratuito que ajuda responsáveis a transformar os alimentos disponíveis em casa em refeições possíveis para a rotina familiar. A experiência central é **“O que tem em casa?”**.

O sistema combina uma interface conversacional com um motor determinístico separado para bloqueios de alergias, restrições e mensagens de segurança. Não inventa porções clínicas, diagnóstico ou referências pediátricas.

## Recursos

- gerador de refeições antes do cadastro;
- perfis infantis isolados por responsável;
- despensa conectada ao gerador;
- refeições salvas, cardápio semanal e lista de compras;
- hábitos e histórico de crescimento sem lógica de IMC adulto;
- consentimentos separados, exportação e solicitação de exclusão;
- analytics minimizados e painel administrativo protegido por função.

## Tecnologias

- Next.js e React
- Vinext para exportação estática e publicação com Sites
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

As sugestões são educativas. Quantidades clínicas individualizadas devem ser definidas por pediatra ou nutricionista. O produto não recomenda jejuns, dietas extremas, medicamentos ou metas rápidas de perda de peso para crianças.
