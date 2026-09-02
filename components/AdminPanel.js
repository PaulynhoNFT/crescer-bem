'use client'

import {useEffect,useMemo,useState} from 'react'
import {supabase} from '../lib/supabase'

const funnel=['landing_viewed','generator_started','meal_generated','account_created','return_7d','return_30d','whatsapp_opted_in']
const labels={landing_viewed:'Visitou',generator_started:'Testou gerador',meal_generated:'Gerou refeição',account_created:'Criou conta',return_7d:'Voltou em 7 dias',return_30d:'Voltou em 30 dias',whatsapp_opted_in:'Autorizou WhatsApp'}

export default function AdminPanel({session}){
 const isAdmin=session.user.app_metadata?.role==='admin'
 const [events,setEvents]=useState([]),[status,setStatus]=useState({loading:true,error:''})
 useEffect(()=>{if(!isAdmin){setStatus({loading:false,error:''});return}supabase.from('product_events').select('event_name,user_id,session_id,occurred_at').gte('occurred_at',new Date(Date.now()-30*86400000).toISOString()).then(({data,error})=>{setEvents(data||[]);setStatus({loading:false,error:error?'Não foi possível carregar as métricas.':''})})},[isAdmin])
 const counts=useMemo(()=>Object.fromEntries(funnel.map(name=>[name,events.filter(event=>event.event_name===name).length])),[events])
 const max=Math.max(1,...Object.values(counts))
 const users=new Set(events.map(event=>event.user_id).filter(Boolean)).size
 if(!isAdmin)return <div className="restricted"><span>ACESSO RESTRITO</span><h2>Painel administrativo protegido.</h2><p>Somente contas autorizadas em metadados seguros do sistema podem consultar métricas agregadas.</p></div>
 return <div className="admin-module"><div className="module-heading"><p className="kicker">OPERAÇÃO DO PRODUTO</p><h2>Onde as famílias encontram valor — e onde param.</h2><p>Janela dos últimos 30 dias. Eventos não contêm nomes, medidas, crescimento ou informações clínicas de crianças.</p></div><div className="metric-row"><article><small>Eventos</small><b>{events.length}</b><span>últimos 30 dias</span></article><article><small>Usuários identificados</small><b>{users}</b><span>IDs técnicos únicos</span></article><article><small>Primeiras refeições</small><b>{counts.meal_generated||0}</b><span>principal ativação</span></article></div>{status.error&&<p className="form-status error">{status.error}</p>}{status.loading?<div className="useful-empty">Carregando métricas agregadas…</div>:<section className="funnel"><h3>Funil de ativação</h3>{funnel.map((name,index)=>{const previous=index?counts[funnel[index-1]]:counts[name];const conversion=previous?Math.round((counts[name]/previous)*100):0;return <div key={name}><span>{labels[name]}</span><i style={{'--width':`${Math.max(4,counts[name]/max*100)}%`}}/><b>{counts[name]}</b><small>{index?`${conversion}% da etapa anterior`:'entrada'}</small></div>})}</section>}</div>
}
