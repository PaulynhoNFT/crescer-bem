'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyChild={nickname:'',birth_date:'',sex_for_growth_reference:'',weight_kg:'',height_cm:''}

export default function Dashboard({session,onLogout,onMeal}){
 const [profile,setProfile]=useState(null)
 const [children,setChildren]=useState([])
 const [child,setChild]=useState(emptyChild)
 const [status,setStatus]=useState({loading:true,saving:false,error:'',success:''})

 const load=async()=>{
  setStatus(s=>({...s,loading:true,error:''}))
  const userId=session.user.id
  const [{data:profileData,error:profileError},{data:childrenData,error:childrenError}]=await Promise.all([
   supabase.from('profiles').select('full_name,phone').eq('id',userId).maybeSingle(),
   supabase.from('children').select('id,nickname,birth_date,sex_for_growth_reference,created_at').eq('parent_id',userId).order('created_at',{ascending:false})
  ])
  if(profileError||childrenError){setStatus({loading:false,saving:false,error:(profileError||childrenError).message,success:''});return}
  const ids=(childrenData||[]).map(item=>item.id)
  let measurements=[]
  if(ids.length){
   const {data,error}=await supabase.from('measurements').select('child_id,weight_kg,height_cm,measured_on').in('child_id',ids).order('measured_on',{ascending:false})
   if(error){setStatus({loading:false,saving:false,error:error.message,success:''});return}
   measurements=data||[]
  }
  const latest=new Map()
  measurements.forEach(item=>{if(!latest.has(item.child_id))latest.set(item.child_id,item)})
  setProfile(profileData)
  setChildren((childrenData||[]).map(item=>({...item,measurement:latest.get(item.id)})))
  setStatus({loading:false,saving:false,error:'',success:''})
 }

 useEffect(()=>{load()},[session.user.id])

 const update=(field,value)=>setChild(current=>({...current,[field]:value}))
 const saveChild=async(event)=>{
  event.preventDefault()
  setStatus(s=>({...s,saving:true,error:'',success:''}))
  if(!child.nickname||!child.birth_date||!child.sex_for_growth_reference||!child.weight_kg||!child.height_cm){setStatus(s=>({...s,saving:false,error:'Preencha todos os dados da criança.'}));return}
  const {data:created,error:createError}=await supabase.from('children').insert({parent_id:session.user.id,nickname:child.nickname,birth_date:child.birth_date,sex_for_growth_reference:child.sex_for_growth_reference}).select('id').single()
  if(createError){setStatus(s=>({...s,saving:false,error:createError.message}));return}
  const {error:measurementError}=await supabase.from('measurements').insert({child_id:created.id,weight_kg:Number(child.weight_kg),height_cm:Number(child.height_cm)})
  if(measurementError){await supabase.from('children').delete().eq('id',created.id);setStatus(s=>({...s,saving:false,error:measurementError.message}));return}
  setChild(emptyChild)
  await load()
  setStatus(s=>({...s,success:'Perfil da criança salvo com segurança.'}))
 }

 return <section className="dashboard-page">
  <div className="dash-top"><div><span className="eyebrow">PAINEL DA FAMÍLIA</span><h1>Olá, {profile?.full_name?.split(' ')[0]||'família'} 👋</h1><p>Organize os próximos passos sem transformar a balança no centro da rotina.</p></div><button className="ghost" onClick={onLogout}>Sair</button></div>
  {status.error&&<p className="form-message error">{status.error}</p>}{status.success&&<p className="form-message success">{status.success}</p>}
  <div className="dash-grid">
   <div className="dash-main">
    <div className="quick-card"><div><span>🍽️</span><div><small>PRÓXIMA REFEIÇÃO</small><h2>O que vocês têm em casa?</h2></div></div><button className="primary" onClick={onMeal}>Montar agora →</button></div>
    <div className="section-title"><div><span className="eyebrow">MEUS FILHOS</span><h2>Perfis da família</h2></div><span>{children.length} cadastrado{children.length===1?'':'s'}</span></div>
    {status.loading?<div className="empty-card">Carregando dados protegidos…</div>:children.length===0?<div className="empty-card"><span>🌱</span><h3>Comece pelo primeiro perfil</h3><p>Cadastre apenas os dados necessários para acompanhar crescimento e hábitos.</p></div>:<div className="child-list">{children.map(item=><article key={item.id}><div className="child-avatar">{item.nickname.slice(0,1).toUpperCase()}</div><div><h3>{item.nickname}</h3><p>Nascimento: {new Date(item.birth_date+'T12:00:00').toLocaleDateString('pt-BR')}</p></div>{item.measurement&&<div className="measure"><b>{item.measurement.weight_kg} kg</b><span>{item.measurement.height_cm} cm</span><small>{new Date(item.measurement.measured_on+'T12:00:00').toLocaleDateString('pt-BR')}</small></div>}</article>)}</div>}
   </div>
   <form className="child-form" onSubmit={saveChild}><span className="eyebrow">NOVO PERFIL</span><h2>Cadastrar criança</h2><p>Esses dados ficam visíveis somente para sua conta.</p><label>Nome ou apelido<input value={child.nickname} onChange={e=>update('nickname',e.target.value)} maxLength="80" placeholder="Como devemos chamar?"/></label><label>Data de nascimento<input value={child.birth_date} onChange={e=>update('birth_date',e.target.value)} type="date" max={new Date().toISOString().slice(0,10)}/></label><label>Referência da curva de crescimento<select value={child.sex_for_growth_reference} onChange={e=>update('sex_for_growth_reference',e.target.value)}><option value="">Selecione</option><option value="female">Feminina</option><option value="male">Masculina</option></select></label><div className="two-fields"><label>Peso atual (kg)<input value={child.weight_kg} onChange={e=>update('weight_kg',e.target.value)} type="number" min="1" max="300" step="0.1" placeholder="Ex.: 32,5"/></label><label>Altura atual (cm)<input value={child.height_cm} onChange={e=>update('height_cm',e.target.value)} type="number" min="20" max="250" step="0.1" placeholder="Ex.: 138"/></label></div><button className="primary full" disabled={status.saving}>{status.saving?'Salvando…':'Salvar perfil'}</button><small>IMC infantil é triagem, não diagnóstico. A avaliação deve considerar idade, sexo e curva de crescimento.</small></form>
  </div>
 </section>
}
