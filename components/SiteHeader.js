'use client'

import {useState} from 'react'
import Brand from './Brand'

export default function SiteHeader({session,view,onNavigate,onLogout}){
 const [open,setOpen]=useState(false)
 const go=next=>{setOpen(false);onNavigate(next)}
 return <header className="site-header"><button className="brand-button" onClick={()=>go('home')}><Brand/></button><nav className={open?'nav-open':''} aria-label="Navegação principal"><button className={view==='generator'?'active':''} onClick={()=>go('generator')}>O que tem em casa?</button><button onClick={()=>go('resources')}>Como funciona</button>{session&&<button className={view==='workspace'?'active':''} onClick={()=>go('workspace')}>Minha família</button>}</nav><div className="header-actions">{session?<><button className="quiet" onClick={()=>go('workspace')}>Abrir painel</button><button className="outline small" onClick={onLogout}>Sair</button></>:<button className="outline" onClick={()=>go('auth')}>Entrar</button>}<button className="menu-button" aria-expanded={open} aria-label={open?'Fechar menu':'Abrir menu'} onClick={()=>setOpen(!open)}>{open?'Fechar':'Menu'}</button></div></header>
}
