'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import Dashboard from './Dashboard'

const foods = [
  ['Arroz','grain','🍚'],['Feijão','legume','🫘'],['Ovo','protein','🥚'],['Frango','protein','🍗'],
  ['Carne','protein','🥩'],['Macarrão','grain','🍝'],['Batata','grain','🥔'],['Tomate','veg','🍅'],
  ['Cenoura','veg','🥕'],['Alface','veg','🥬'],['Brócolis','veg','🥦'],['Banana','fruit','🍌']
]

function MealBuilder({ compact=false }) {
  const [selected,setSelected] = useState(['Arroz','Feijão','Ovo','Tomate'])
  const [result,setResult] = useState(false)
  const toggle = name => setSelected(s => s.includes(name) ? s.filter(x=>x!==name) : [...s,name])
  const chosen = useMemo(()=>foods.filter(f=>selected.includes(f[0])),[selected])
  const portions = {Arroz:'2–4 colheres de sopa',Feijão:'½–1 concha pequena',Ovo:'1 unidade',Frango:'1 filé pequeno',Carne:'1 porção pequena',Macarrão:'½–1 xícara',Batata:'1 unidade pequena',Tomate:'à vontade, respeitando a fome',Cenoura:'2–4 colheres de sopa',Alface:'à vontade, respeitando a fome',Brócolis:'2–4 colheres de sopa',Banana:'1 unidade pequena'}
  return <div className={compact?'demo card':'builder card'}>
    <div className="builder-head"><div><span className="eyebrow">MONTADOR INTELIGENTE</span><h2>{compact?'O que tem em casa hoje?':'Monte uma refeição com o que você tem'}</h2></div><span className="step">{selected.length} itens</span></div>
    <div className="food-grid">{foods.map(([name,,icon])=><button key={name} onClick={()=>toggle(name)} className={'food '+(selected.includes(name)?'on':'')}><span>{icon}</span>{name}<i className="check">✓</i></button>)}</div>
    <button className="primary full" onClick={()=>setResult(true)}>Montar refeição <span>→</span></button>
    {result && <div className="result"><div className="result-title"><span>✨</span><div><strong>Sugestão equilibrada</strong><small>Orientação educativa, não prescrição médica</small></div></div>
      <div className="plate">{chosen.slice(0,5).map(([name,,icon])=><div key={name}><span>{icon}</span><p><b>{name}</b><small>{portions[name]}</small></p></div>)}</div>
      <p className="safety">As porções são faixas gerais e devem respeitar idade, crescimento, fome e saciedade. Para quantidades clínicas individualizadas, consulte pediatra ou nutricionista.</p>
    </div>}
  </div>
}

export default function Home(){
 const [view,setView]=useState('home'); const [menu,setMenu]=useState(false)
 const [session,setSession]=useState(null)
 const [signup,setSignup]=useState({name:'',email:'',phone:'',password:'',terms:false,whatsapp:false})
 const [signupStatus,setSignupStatus]=useState({loading:false,error:'',success:''})
 const [login,setLogin]=useState({email:'',password:''})
 const [loginStatus,setLoginStatus]=useState({loading:false,error:''})
 const go=v=>{setView(v);setMenu(false);window.scrollTo({top:0,behavior:'smooth'})}
 useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(({data})=>setSession(data.session));const {data}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));return()=>data.subscription.unsubscribe()},[])
 const updateSignup=(field,value)=>setSignup(s=>({...s,[field]:value}))
 const createAccount=async()=>{
  setSignupStatus({loading:true,error:'',success:''})
  if(!signup.terms){setSignupStatus({loading:false,error:'Aceite os Termos e a Política de Privacidade para continuar.',success:''});return}
  if(signup.password.length<8){setSignupStatus({loading:false,error:'A senha precisa ter pelo menos 8 caracteres.',success:''});return}
  if(!supabase){setSignupStatus({loading:false,error:'A conexão segura ainda não está disponível.',success:''});return}
  const {data,error}=await supabase.auth.signUp({email:signup.email,password:signup.password,options:{data:{full_name:signup.name,phone:signup.phone,whatsapp_opt_in:signup.whatsapp,email_opt_in:false}}})
  if(error){setSignupStatus({loading:false,error:error.message,success:''});return}
  if(data.session){setSession(data.session);go('dashboard');setSignupStatus({loading:false,error:'',success:''});return}
  setSignupStatus({loading:false,error:'',success:'Conta criada! Confira seu e-mail para confirmar o cadastro.'})
 }
 const signIn=async(event)=>{event.preventDefault();setLoginStatus({loading:true,error:''});if(!supabase){setLoginStatus({loading:false,error:'A conexão segura ainda não está disponível.'});return}const {data,error}=await supabase.auth.signInWithPassword(login);if(error){setLoginStatus({loading:false,error:'E-mail ou senha incorretos, ou conta ainda não confirmada.'});return}setSession(data.session);setLoginStatus({loading:false,error:''});go('dashboard')}
 const signOut=async()=>{await supabase?.auth.signOut();setSession(null);go('home')}
 return <main>
  <header><button className="brand" onClick={()=>go('home')}><span className="logo">🍎</span><span>Crescer <b>Bem</b></span></button><nav className={menu?'open':''}><button onClick={()=>go('home')}>Início</button><button onClick={()=>go('builder')}>Montar refeição</button>{session&&<button onClick={()=>go('dashboard')}>Minha família</button>}<a href="#seguranca">Segurança</a></nav><button className="login" onClick={()=>go(session?'dashboard':'login')}>{session?'Meu painel':'Entrar'}</button><button className="hamb" onClick={()=>setMenu(!menu)}>☰</button></header>
  {view==='home' && <>
   <section className="hero"><div className="hero-copy"><span className="pill">100% GRATUITO PARA FAMÍLIAS</span><h1>Comer melhor começa com o que você <em>já tem em casa.</em></h1><p>Ideias simples de refeições, receitas e hábitos saudáveis para sua família — sem dietas radicais e sem culpa.</p><div className="actions"><button className="primary" onClick={()=>go('builder')}>Montar uma refeição <span>→</span></button><a href="#como">Veja como funciona</a></div><div className="trust"><span>✓ Sem cartão</span><span>✓ Feito para o Brasil</span><span>✓ Privacidade em primeiro lugar</span></div></div><div className="hero-card"><MealBuilder compact/></div></section>
   <section className="proof"><p>UMA ROTINA MAIS LEVE PARA TODA A FAMÍLIA</p><div><span><b>🍽️</b>Refeições práticas</span><span><b>🧺</b>Menos desperdício</span><span><b>🌱</b>Hábitos positivos</span><span><b>🛡️</b>Orientação segura</span></div></section>
   <section id="como" className="how"><span className="eyebrow">SIMPLES DE VERDADE</span><h2>Da despensa para a mesa em três passos</h2><p className="lead">Sem contar calorias. Sem alimentos proibidos. Só escolhas mais equilibradas para a rotina real.</p><div className="steps"><article><span>01</span><i>🧺</i><h3>Conte o que tem</h3><p>Escolha os alimentos disponíveis na geladeira e na despensa.</p></article><article><span>02</span><i>✨</i><h3>Receba uma sugestão</h3><p>Combinamos os itens em uma refeição simples e equilibrada.</p></article><article><span>03</span><i>💚</i><h3>Adapte à família</h3><p>Troque ingredientes e respeite os sinais de fome e saciedade.</p></article></div></section>
   <section id="seguranca" className="care"><div><span className="eyebrow">CRESCER COM SAÚDE</span><h2>Muito além do número na balança</h2><p>O Crescer Bem acompanha hábitos que realmente importam: variedade alimentar, hidratação, sono, movimento e refeições em família.</p><ul><li>✓ Linguagem acolhedora, sem culpa</li><li>✓ Nada de dietas radicais ou metas rápidas</li><li>✓ Dados de crianças protegidos</li><li>✓ Alertas para procurar ajuda profissional</li></ul><button className="primary" onClick={()=>go('signup')}>Começar gratuitamente</button></div><div className="habit-card"><div className="week"><strong>Hábitos da semana</strong><span>7 dias</span></div><div className="rings"><div className="ring green">5<small>frutas</small></div><div className="ring blue">6<small>água</small></div><div className="ring orange">4<small>movimento</small></div></div><div className="challenge"><span>🌈</span><div><small>DESAFIO DA SEMANA</small><b>Prato de 5 cores</b><p>3 de 5 cores experimentadas</p></div></div></div></section>
   <section className="cta"><span>🍎</span><div><h2>Uma escolha saudável por vez.</h2><p>Experimente agora e monte a próxima refeição da sua família.</p></div><button onClick={()=>go('builder')}>Montar refeição grátis →</button></section>
  </>}
  {view==='builder' && <section className="app-page"><button className="back" onClick={()=>go('home')}>← Voltar</button><span className="pill">EXPERIMENTE SEM CADASTRO</span><h1>O que vocês têm em casa?</h1><p>Selecione os alimentos e receba uma combinação educativa. Nenhum dado é salvo nesta demonstração.</p><MealBuilder/></section>}
  {view==='login' && <section className="app-page signup"><button className="back" onClick={()=>go('home')}>← Voltar</button><form className="form-card" onSubmit={signIn}><span className="logo big">🍎</span><span className="eyebrow">ÁREA DA FAMÍLIA</span><h1>Entrar</h1><p>Acesse seus perfis e acompanhe a rotina da família.</p><label>E-mail<input value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} type="email" required placeholder="voce@email.com"/></label><label>Senha<input value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} type="password" required placeholder="Sua senha"/></label>{loginStatus.error&&<p className="form-message error">{loginStatus.error}</p>}<button className="primary full" disabled={loginStatus.loading}>{loginStatus.loading?'Entrando…':'Entrar →'}</button><button type="button" className="text-button" onClick={()=>go('signup')}>Ainda não tenho conta</button></form></section>}
  {view==='signup' && <section className="app-page signup"><button className="back" onClick={()=>go('home')}>← Voltar</button><div className="form-card"><span className="logo big">🍎</span><span className="eyebrow">CONTA DO RESPONSÁVEL</span><h1>Comece gratuitamente</h1><p>Seus dados de contato são separados dos dados da criança.</p><label>Seu nome<input value={signup.name} onChange={e=>updateSignup('name',e.target.value)} placeholder="Nome do pai, mãe ou responsável"/></label><label>E-mail<input value={signup.email} onChange={e=>updateSignup('email',e.target.value)} type="email" placeholder="voce@email.com"/></label><label>WhatsApp<input value={signup.phone} onChange={e=>updateSignup('phone',e.target.value)} type="tel" placeholder="(11) 99999-9999"/></label><label>Senha<input value={signup.password} onChange={e=>updateSignup('password',e.target.value)} type="password" placeholder="Mínimo de 8 caracteres"/></label><label className="consent"><input checked={signup.terms} onChange={e=>updateSignup('terms',e.target.checked)} type="checkbox"/> Li e aceito os Termos e a Política de Privacidade.</label><label className="consent optional"><input checked={signup.whatsapp} onChange={e=>updateSignup('whatsapp',e.target.checked)} type="checkbox"/> Quero receber dicas e receitas pelo WhatsApp (opcional).</label>{signupStatus.error&&<p className="form-message error">{signupStatus.error}</p>}{signupStatus.success&&<p className="form-message success">{signupStatus.success}</p>}<button className="primary full" disabled={signupStatus.loading} onClick={createAccount}>{signupStatus.loading?'Criando conta…':'Continuar grátis →'}</button><small>Não vendemos dados pessoais nem usamos informações de saúde infantil para publicidade.</small></div></section>}
  {view==='dashboard'&&session&&<Dashboard session={session} onLogout={signOut} onMeal={()=>go('builder')}/>}
  {view==='dashboard'&&!session&&<section className="app-page"><h1>Entre para acessar sua família</h1><button className="primary" onClick={()=>go('login')}>Entrar</button></section>}
  <footer><div className="brand"><span className="logo">🍎</span><span>Crescer <b>Bem</b></span></div><p>Assistente gratuito de alimentação saudável para famílias.</p><small>Este serviço oferece orientação educativa e não substitui avaliação de pediatra ou nutricionista.</small></footer>
 </main>
}
