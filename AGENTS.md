# AI LABS — Assistente de Alimentação Familiar

Este repositório contém um produto gratuito que ajuda famílias a preparar refeições melhores com os alimentos disponíveis em casa.

## Ordem de prioridades

1. Segurança
2. Privacidade
3. Clareza
4. Utilidade
5. Experiência mobile
6. Conversão
7. Performance
8. Estética

Nunca sacrificar segurança ou privacidade por conversão. Tratar dados infantis como altamente sensíveis, aplicar minimização, acesso mínimo, auditoria, exportação e exclusão. Não vender dados de crianças nem usá-los para publicidade comportamental.

## Posicionamento e linguagem

O produto é um assistente de alimentação saudável, planejamento e aproveitamento de alimentos. Não é ferramenta de emagrecimento, dieta infantil, controle corporal, diagnóstico ou substituto de pediatra/nutricionista.

Evitar emagrecimento, corpo ideal, culpa e calorias como objetivo. Preferir alimentação, variedade, rotina, refeições, hábitos, crescimento, desenvolvimento, praticidade e família.

## Arquitetura de segurança

Separar IA conversacional do motor determinístico. A conversa pode interpretar, explicar e adaptar; regras, porções, faixas etárias, restrições, equivalências e bloqueios pertencem ao motor determinístico. Nunca inventar limites clínicos, referências pediátricas ou dados nutricionais. Usar mocks claramente identificados quando a fonte oficial não estiver integrada.

O fluxo central é: ingredientes → interpretação → validação determinística → sugestão → preparo/salvamento/substituição → feedback.

## Produto e UX

- Mobile-first: responsável usando o celular na cozinha.
- Poucos passos, botões grandes, leitura rápida e feedback imediato.
- Progressive disclosure, defaults inteligentes e estados vazios úteis.
- A primeira refeição útil é a principal métrica de ativação.
- Componentes pequenos, com apresentação, domínio, serviços, regras, analytics, autenticação, dados e segurança separados.

## Design

Direção premium, humana, editorial, tecnológica e acolhedora. Usar tipografia expressiva, espaço negativo, alimentos e cozinhas reais, cores quentes e microinterações sutis. Evitar roxo neon, glassmorphism, excesso de cards/ícones/gradientes, dashboards pesados, estética médica fria e aparência de dieta ou template genérico de IA.

Centralizar tokens de cores, tipografia, espaçamento, raios, sombras, breakpoints e movimento.

## Privacidade, consentimentos e analytics

Separar termos, privacidade, comunicações e WhatsApp. Registrar finalidade, status, data, versão e origem; permitir revogação. WhatsApp exige opt-in e opt-out simples.

Eventos permitidos incluem: `landing_viewed`, `generator_started`, `ingredient_added`, `meal_generated`, `meal_saved`, `meal_rejected`, `substitution_requested`, `pantry_created`, `weekly_menu_created`, `shopping_list_created`, `account_created`, `whatsapp_opted_in`, `whatsapp_opted_out`, `return_7d`, `return_30d`.

Nunca enviar nome de criança, peso, crescimento, informações clínicas ou ingredientes para analytics. Usar IDs técnicos e metadados agregados mínimos.

## Crescimento

Não usar IMC adulto simplificado. Preparar arquitetura para idade, sexo, medidas apropriadas, referências pediátricas versionadas, curvas e histórico. Sem diagnóstico, rankings, metas corporais ou alertas alarmistas.

## Qualidade obrigatória

Considerar WCAG, contraste, foco, teclado, semântica, leitores de tela, áreas de toque e `prefers-reduced-motion`. Priorizar Core Web Vitals, imagens otimizadas, JavaScript mínimo e fontes eficientes. Landing pages devem ter metadata, headings semânticos, Open Graph, URLs limpas e conteúdo indexável.

Antes de concluir: executar, testar fluxos e erros, revisar visualmente em desktop e mobile quando possível, verificar console, corrigir e repetir. Perguntar se está bonito, claro, rápido, acessível, responsivo, útil, real e seguro.
