'use client'

import {useState} from 'react'
import MealGenerator from './MealGenerator'
import FamilyPanel from './FamilyPanel'
import PantryPanel from './PantryPanel'
import PlannerPanel from './PlannerPanel'
import GrowthPanel from './GrowthPanel'
import PrivacyPanel from './PrivacyPanel'
import AdminPanel from './AdminPanel'

const tabs=[['today','Hoje'],['family','Família'],['pantry','Despensa'],['planner','Planejamento'],['growth','Crescimento'],['privacy','Privacidade']]

export default function AppWorkspace({session,family,onLogout,onNavigate}){
 const [tab,setTab]=useState('today')
 const [useFood,setUseFood]=useState('')
 const isAdmin=session.user.app_metadata?.role==='admin'
 const openGenerator=name=>{setUseFood('');requestAnimationFrame(()=>setUseFood(name));setTab('today')}
 return <main className="workspace" id="conteudo"><aside className="workspace-sidebar"><div className="account-summary"><span>{(session.user.user_metadata?.full_name||session.user.email).slice(0,1).toUpperCase()}</span><div><b>{session.user.user_metadata?.full_name||'Responsável'}</b><small>{session.user.email}</small></div></div><nav aria-label="Área da família">{tabs.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}{isAdmin&&<button className={tab==='admin'?'active':''} onClick={()=>setTab('admin')}>Administração</button>}</nav><button className="sidebar-logout" onClick={onLogout}>Sair da conta</button></aside><section className="workspace-main"><header className="workspace-top"><div><small>PERFIL ATIVO</small><b>{family.activeChild?.nickname||'Nenhum perfil selecionado'}</b></div>{family.children.length>1&&<select value={family.activeId||''} onChange={e=>family.select(e.target.value)} aria-label="Alternar perfil">{family.children.map(child=><option value={child.id} key={child.id}>{child.nickname}</option>)}</select>}</header>{tab==='today'&&<div className="today-view"><div className="today-intro"><p className="kicker">AGORA, NA COZINHA</p><h1>O que vamos preparar?</h1><p>{family.activeChild?`A sugestão respeitará as informações registradas para ${family.activeChild.nickname}.`:'Você pode gerar uma ideia sem perfil. Selecione uma criança apenas para aplicar restrições salvas.'}</p></div>{useFood&&<p className="context-note">Da despensa para o gerador: <b>{useFood}</b> já foi adicionado.</p>}<MealGenerator embedded session={session} activeChild={family.activeChild} onNavigate={onNavigate} initialIngredient={useFood}/></div>}{tab==='family'&&<FamilyPanel session={session} family={family}/>} {tab==='pantry'&&<PantryPanel session={session} onUse={openGenerator}/>} {tab==='planner'&&<PlannerPanel session={session} activeChild={family.activeChild}/>} {tab==='growth'&&<GrowthPanel activeChild={family.activeChild}/>} {tab==='privacy'&&<PrivacyPanel session={session} onLogout={onLogout}/>} {tab==='admin'&&<AdminPanel session={session}/>}</section><nav className="mobile-workspace-nav" aria-label="Navegação do aplicativo">{tabs.slice(0,5).map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</nav></main>
}
