'use client'

import {useState} from 'react'
import {supabase} from '../lib/supabase'

const empty={nickname:'',birth_date:'',sex_for_growth_reference:'',allergies:'',intolerances:'',dislikes:''}

export default function FamilyPanel({session,family}){
 const [form,setForm]=useState(empty)
 const [editing,setEditing]=useState(null)
 const [status,setStatus]=useState({saving:false,error:'',success:''})
 const update=(key,value)=>setForm(current=>({...current,[key]:value}))
 const edit=child=>{setEditing(child.id);setForm({...child,allergies:(child.allergies||[]).join(', '),intolerances:(child.intolerances||[]).join(', '),dislikes:(child.dislikes||[]).join(', ')})}
 const reset=()=>{setEditing(null);setForm(empty)}
 const save=async event=>{
  event.preventDefault();setStatus({saving:true,error:'',success:''})
  const payload={nickname:form.nickname.trim(),birth_date:form.birth_date,sex_for_growth_reference:form.sex_for_growth_reference||null,allergies:form.allergies.split(',').map(item=>item.trim()).filter(Boolean),intolerances:form.intolerances.split(',').map(item=>item.trim()).filter(Boolean),dislikes:form.dislikes.split(',').map(item=>item.trim()).filter(Boolean)}
  const request=editing?supabase.from('children').update(payload).eq('id',editing):supabase.from('children').insert({...payload,parent_id:session.user.id})
  const {error}=await request
  if(error){setStatus({saving:false,error:'Não foi possível salvar o perfil. Revise os dados.',success:''});return}
  await family.refresh();reset();setStatus({saving:false,error:'',success:'Perfil salvo. Cada criança continua com dados separados.'})
 }
 return <div className="module-layout"><section><div className="module-heading"><p className="kicker">FAMÍLIA</p><h2>Perfis separados, contexto preservado.</h2><p>Selecione quem está usando o gerador. O sistema bloqueia ingredientes marcados como alergia nesse perfil.</p></div>{family.error&&<p className="form-status error">{family.error}</p>}{family.loading?<div className="useful-empty">Carregando perfis protegidos…</div>:family.children.length===0?<div className="useful-empty"><span>PRIMEIRO PASSO</span><h3>Cadastre um apelido e o mínimo necessário.</h3><p>Você poderá experimentar o gerador mesmo sem inserir medidas.</p></div>:<div className="profile-list">{family.children.map(child=><article className={family.activeId===child.id?'selected':''} key={child.id}><button className="profile-select" onClick={()=>family.select(child.id)}><span>{child.nickname.slice(0,1).toUpperCase()}</span><div><b>{child.nickname}</b><small>{new Date(child.birth_date+'T12:00:00').toLocaleDateString('pt-BR')}</small></div>{family.activeId===child.id&&<i>Em uso</i>}</button><button className="edit-link" onClick={()=>edit(child)}>Editar</button></article>)}</div>}</section><form className="module-form" onSubmit={save}><div><p className="kicker">{editing?'EDITAR PERFIL':'NOVO PERFIL'}</p><h3>{editing?'Atualize somente o necessário':'Adicionar criança'}</h3></div><label>Nome ou apelido<input required maxLength="80" value={form.nickname} onChange={e=>update('nickname',e.target.value)}/></label><label>Data de nascimento<input required type="date" max={new Date().toISOString().slice(0,10)} value={form.birth_date} onChange={e=>update('birth_date',e.target.value)}/></label><label>Referência para curvas pediátricas <small>opcional agora</small><select value={form.sex_for_growth_reference||''} onChange={e=>update('sex_for_growth_reference',e.target.value)}><option value="">Não informar</option><option value="female">Feminina</option><option value="male">Masculina</option></select><small className="field-help">Usada somente quando uma referência pediátrica versionada estiver integrada.</small></label><label>Alergias conhecidas <small>separe por vírgula</small><input value={form.allergies} onChange={e=>update('allergies',e.target.value)} placeholder="Ex.: amendoim, leite"/></label><details><summary>Preferências adicionais</summary><label>Intolerâncias<input value={form.intolerances} onChange={e=>update('intolerances',e.target.value)}/></label><label>Alimentos que não aceita bem<input value={form.dislikes} onChange={e=>update('dislikes',e.target.value)}/></label></details>{status.error&&<p className="form-status error">{status.error}</p>}{status.success&&<p className="form-status success">{status.success}</p>}<button className="button primary full" disabled={status.saving}>{status.saving?'Salvando…':'Salvar perfil'}</button>{editing&&<button type="button" className="text-link center" onClick={reset}>Cancelar edição</button>}</form></div>
}
