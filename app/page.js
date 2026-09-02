'use client'

import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {flushEvents,trackReturnMilestones} from '../services/analytics'
import {useFamily} from '../hooks/useFamily'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import Landing from '../components/Landing'
import MealGenerator from '../components/MealGenerator'
import AuthView from '../components/AuthView'
import AppWorkspace from '../components/AppWorkspace'

const validViews=new Set(['home','generator','auth','workspace'])

export default function Home(){
 const [view,setView]=useState('home')
 const [session,setSession]=useState(null)
 const [authReady,setAuthReady]=useState(true)
 const [recovery,setRecovery]=useState(false)
 const family=useFamily(session)

 useEffect(()=>{
  const fromHash=window.location.hash.replace('#/','')
  if(validViews.has(fromHash))setView(fromHash)
  if(!supabase){setAuthReady(true);return}
  supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthReady(true);if(data.session){flushEvents(data.session.user.id);trackReturnMilestones(data.session.user)}})
  const {data}=supabase.auth.onAuthStateChange((event,next)=>{setSession(next);setAuthReady(true);if(event==='PASSWORD_RECOVERY'){setRecovery(true);setView('auth')}if(next){flushEvents(next.user.id);trackReturnMilestones(next.user)}})
  return()=>data.subscription.unsubscribe()
 },[])

 const navigate=next=>{
  if(next==='resources'){
   setView('home');history.replaceState(null,'','#/home');requestAnimationFrame(()=>setTimeout(()=>document.getElementById('recursos')?.scrollIntoView({behavior:'smooth'}),20));return
  }
  const safe=validViews.has(next)?next:'home'
  setView(safe);history.replaceState(null,'',`#/${safe}`);window.scrollTo({top:0,behavior:'smooth'})
 }
 const logout=async()=>{await supabase?.auth.signOut();setSession(null);navigate('home')}
 const authenticated=next=>{setSession(next);navigate('workspace')}
 const effectiveView=view==='workspace'&&!session?'auth':view

 return <div className="site-shell"><a className="skip-link" href="#conteudo">Pular para o conteúdo</a>{effectiveView!=='auth'&&<SiteHeader session={session} view={effectiveView} onNavigate={navigate} onLogout={logout}/>} {!authReady&&<main className="loading-page" id="conteudo"><span>AI LABS</span><p>Preparando uma experiência segura…</p></main>} {authReady&&effectiveView==='home'&&<Landing session={session} onNavigate={navigate}/>} {authReady&&effectiveView==='generator'&&<MealGenerator session={session} activeChild={family.activeChild} onNavigate={navigate}/>} {authReady&&effectiveView==='auth'&&<AuthView mode={recovery?'new-password':'signin'} onNavigate={navigate} onAuthenticated={authenticated} onRecoveryComplete={()=>{setRecovery(false);navigate('workspace')}}/>} {authReady&&effectiveView==='workspace'&&session&&<AppWorkspace session={session} family={family} onLogout={logout} onNavigate={navigate}/>} {effectiveView!=='auth'&&effectiveView!=='workspace'&&<SiteFooter onNavigate={navigate}/>}</div>
}
