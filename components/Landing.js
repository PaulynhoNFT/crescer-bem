'use client'

import {useEffect} from 'react'
import {track} from '../services/analytics'

const structuredData={
 '@context':'https://schema.org','@type':'SoftwareApplication',name:'AI LABS — alimentação em família',applicationCategory:'LifestyleApplication',operatingSystem:'Web',offers:{'@type':'Offer',price:'0',priceCurrency:'BRL'},description:'Assistente gratuito para planejar refeições familiares usando os alimentos disponíveis em casa.'
}

export default function Landing({session,onNavigate}){
 useEffect(()=>{track('landing_viewed',{userId:session?.user?.id})},[session?.user?.id])
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
  <main id="conteudo">
   <section className="hero-section">
    <div className="hero-content"><p className="kicker">GRATUITO PARA TODAS AS FAMÍLIAS</p><h1>O que tem em casa pode virar uma <em>boa refeição.</em></h1><p className="hero-lead">Um assistente inteligente para planejar refeições com o que você já tem — de um jeito simples, seguro e possível na rotina real.</p><div className="hero-actions"><button className="button primary" onClick={()=>onNavigate('generator')}>Experimentar gratuitamente</button><button className="text-link" onClick={()=>onNavigate('resources')}>Entender como funciona <span aria-hidden="true">↘</span></button></div><p className="micro-trust">Sem cartão · Sem dieta · Privacidade por padrão</p></div>
    <div className="hero-visual"><img src="/hero-kitchen.webp" alt="Arroz, feijão, frango e vegetais sendo organizados em uma cozinha familiar" width="1535" height="1024" fetchPriority="high"/><div className="hero-note"><span>Agora, na cozinha</span><b>Arroz + feijão + ovo + tomate</b><button onClick={()=>onNavigate('generator')}>Montar uma refeição</button></div></div>
   </section>

   <section className="flow-strip" aria-label="Como uma sugestão é criada"><div><span>01</span><b>Você conta o que tem</b><small>Em linguagem simples ou escolhendo ingredientes.</small></div><i aria-hidden="true">→</i><div><span>02</span><b>As regras verificam</b><small>Alergias, variedade e limites do sistema.</small></div><i aria-hidden="true">→</i><div><span>03</span><b>A refeição aparece</b><small>Com preparo, trocas e orientações claras.</small></div></section>

   <section className="editorial-section" id="recursos"><div className="section-intro"><p className="kicker">MENOS DECISÕES. MAIS ROTINA.</p><h2>Feito para o momento em que a geladeira está aberta e falta uma ideia.</h2><p>A experiência começa antes do cadastro. Você testa o gerador, entende o valor e só cria uma conta se quiser salvar e organizar a rotina.</p></div><div className="feature-composition"><article className="feature-large"><span className="feature-index">01</span><h3>O que tem em casa?</h3><p>Digite os ingredientes disponíveis. O sistema organiza a combinação, aponta o que pode completar a variedade e evita alimentos marcados como alergia.</p><button className="text-link light" onClick={()=>onNavigate('generator')}>Testar agora →</button></article><article className="feature-tall"><span>DESPENSA</span><h3>Aproveite primeiro o que já comprou.</h3><p>Menos desperdício, sugestões conectadas ao estoque e lista de compras só com o que falta.</p></article><article className="feature-wide"><span>UMA ROTINA CONECTADA</span><p>Refeições salvas alimentam o cardápio; o cardápio cria a lista; a despensa ajuda nas substituições.</p><div className="connected-line"><b>Despensa</b><i>↔</i><b>Cardápio</b><i>↔</i><b>Compras</b></div></article></div></section>

   <section className="trust-section"><div className="trust-statement"><p className="kicker">SEGURANÇA NÃO É UM AVISO NO RODAPÉ</p><h2>A conversa ajuda. As regras decidem o que pode ser mostrado.</h2><p>A camada conversacional nunca inventa limites clínicos. A composição passa por validações determinísticas e, quando falta uma referência confiável, o sistema diz que não sabe.</p></div><div className="architecture-visual"><div><span>LINGUAGEM</span><b>Interpreta o pedido</b><small>Explica e adapta a resposta</small></div><i aria-hidden="true">↓</i><div className="rules-box"><span>REGRAS DE SEGURANÇA</span><b>Valida antes de exibir</b><small>Alergias · restrições · referências</small></div><i aria-hidden="true">↓</i><div><span>RESULTADO</span><b>Sugestão educativa</b><small>Sem diagnóstico ou dieta automática</small></div></div></section>

   <section className="privacy-section"><div className="privacy-number">01</div><div><p className="kicker">PRIVACIDADE POR PADRÃO</p><h2>Dados de crianças não são moeda de troca.</h2></div><div className="privacy-points"><p><b>Coleta mínima.</b> Pedimos apenas o necessário para a função escolhida.</p><p><b>Sem publicidade sensível.</b> Peso, crescimento e alimentação infantil nunca viram segmentação.</p><p><b>Você controla.</b> Consentimentos separados, exportação e solicitação de exclusão.</p></div></section>

   <section className="final-invite"><p>O jantar não precisa começar com mais uma pesquisa.</p><h2>Comece com o que já está na sua cozinha.</h2><button className="button warm" onClick={()=>onNavigate('generator')}>Abrir o gerador</button></section>
  </main>
 </>
}
