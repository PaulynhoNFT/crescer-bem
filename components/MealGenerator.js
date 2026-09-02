'use client'

import {useEffect,useMemo,useRef,useState} from 'react'
import {CATEGORY_LABELS,FOOD_CATALOG,normalizeFood,suggestionsFor} from '../domain/nutrition/catalog'
import {generateMeal} from '../domain/recipes/generateMeal'
import {supabase} from '../lib/supabase'
import {track} from '../services/analytics'

const QUICK=['Arroz','Feijão','Banana','Ovo','Frango','Tomate','Aveia','Leite','Batata']

export default function MealGenerator({session,activeChild,onNavigate,embedded=false,initialIngredient=''}){
 const [ingredients,setIngredients]=useState([])
 const [input,setInput]=useState('')
 const [stage,setStage]=useState('idle')
 const [result,setResult]=useState(null)
 const [message,setMessage]=useState('')
 const [savedId,setSavedId]=useState(null)
 const [feedback,setFeedback]=useState('')
 const attempt=useRef(0)
 const suggestions=useMemo(()=>FOOD_CATALOG.filter(food=>normalizeFood(food.name).includes(normalizeFood(input))).slice(0,5),[input])
 const profile={allergies:activeChild?.allergies||[],restrictions:activeChild?.intolerances||[]}

 useEffect(()=>{
  if(!initialIngredient)return
  setIngredients(current=>current.some(item=>normalizeFood(item)===normalizeFood(initialIngredient))?current:[...current,initialIngredient])
  setResult(null);setStage('idle');setMessage('Alimento trazido da sua despensa.')
 },[initialIngredient])

 const add=value=>{
  const names=String(value).split(',').map(item=>item.trim()).filter(Boolean)
  let added=0
  setIngredients(current=>{const next=[...current];for(const name of names){if(!next.some(item=>normalizeFood(item)===normalizeFood(name))){next.push(name);added++}}return next})
  if(added){track('ingredient_added',{userId:session?.user?.id,metadata:{count:added}});setMessage('')}
  else if(names.length)setMessage('Esse alimento já está na lista.')
  setInput('');setResult(null);setStage('idle')
 }
 const remove=name=>{setIngredients(items=>items.filter(item=>item!==name));setResult(null);setStage('idle')}
 const generate=async()=>{
  setMessage('');setResult(null);setSavedId(null);setFeedback('');track('generator_started',{userId:session?.user?.id,metadata:{ingredient_count:ingredients.length}})
  if(!ingredients.length){setMessage('Adicione pelo menos um alimento para começar.');return}
  setStage('assembling');await new Promise(resolve=>setTimeout(resolve,420));setStage('checking');await new Promise(resolve=>setTimeout(resolve,420))
  const next=generateMeal(ingredients,profile);setResult(next);setStage('ready')
  track(next.status==='ready'?'meal_generated':'meal_rejected',{userId:session?.user?.id,metadata:{ingredient_count:ingredients.length,reason:next.code||'validated'}})
 }
 const substitute=()=>{
  if(!result?.foods?.length)return
  const position=attempt.current++%result.foods.length
  const target=result.foods[position]
  const options=suggestionsFor(target.category,[...ingredients,...profile.allergies,...profile.restrictions,...(activeChild?.dislikes||[])])
  const replacement=options.length?options[attempt.current%options.length]:null
  if(!replacement){setMessage('Não encontramos uma troca segura nessa categoria. Adicione outro alimento disponível.');return}
  const next=ingredients.map((name,index)=>index===position?replacement.name:name);setIngredients(next);setResult(generateMeal(next,profile));track('substitution_requested',{userId:session?.user?.id,metadata:{category:target.category}})
 }
 const save=async()=>{
  if(!result||result.status!=='ready')return
  if(session&&activeChild&&supabase){const {data,error}=await supabase.from('meals').insert({child_id:activeChild.id,meal_type:'lunch',foods:result.foods,title:result.title,recipe_snapshot:result,saved:true,source:'assistant'}).select('id').single();if(error){setMessage('Não foi possível salvar agora. Tente novamente.');return}setSavedId(data.id)}else{const stored=JSON.parse(localStorage.getItem('ai-labs-saved-meals')||'[]');stored.unshift({...result,saved_at:new Date().toISOString()});localStorage.setItem('ai-labs-saved-meals',JSON.stringify(stored.slice(0,10)));setSavedId('device')}
  setMessage(session&&activeChild?'Refeição salva no perfil.':'Refeição salva neste dispositivo.');track('meal_saved',{userId:session?.user?.id,metadata:{signed_in:Boolean(session)}})
 }
 const react=value=>{setFeedback(value);if(value==='disliked')track('meal_rejected',{userId:session?.user?.id,metadata:{feedback:value}})}
 return <main className={embedded?'generator embedded':'generator-page'} id="conteudo">
  {!embedded&&<div className="generator-heading"><p className="kicker">A EXPERIÊNCIA PRINCIPAL</p><h1>O que tem em casa?</h1><p>Conte o que está disponível. A sugestão usa regras locais de composição e nunca inventa uma prescrição clínica.</p></div>}
  <div className="generator-layout">
   <section className="ingredient-panel" aria-labelledby="ingredient-title"><div className="panel-top"><div><span>PASSO 1</span><h2 id="ingredient-title">Ingredientes disponíveis</h2></div>{activeChild?<div className="active-profile"><small>Perfil selecionado</small><b>{activeChild.nickname}</b></div>:<button className="profile-prompt" onClick={()=>onNavigate?.(session?'workspace':'auth')}>{session?'Selecionar perfil':'Usar sem perfil'}</button>}</div>
    <label className="ingredient-input"><span>Digite um alimento</span><div><input value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();add(input)}}} placeholder="Ex.: arroz, feijão, tomate" autoComplete="off"/><button onClick={()=>add(input)} aria-label="Adicionar alimento">Adicionar</button></div></label>
    {input&&<div className="typeahead" role="listbox" aria-label="Sugestões">{suggestions.map(food=><button key={food.name} onClick={()=>add(food.name)}>{food.name}<small>{food.category}</small></button>)}</div>}
    <div className="quick-list"><span>Mais usados</span><div>{QUICK.map(name=><button key={name} disabled={ingredients.some(item=>normalizeFood(item)===normalizeFood(name))} onClick={()=>add(name)}>+ {name}</button>)}</div></div>
    <div className="selected-list" aria-live="polite"><div><b>{ingredients.length?`${ingredients.length} ingrediente${ingredients.length===1?'':'s'}`:'Sua lista está vazia'}</b>{ingredients.length>0&&<button onClick={()=>{setIngredients([]);setResult(null)}}>Limpar</button>}</div>{ingredients.length>0?<ul>{ingredients.map(name=><li key={name}><span>{name}</span><button onClick={()=>remove(name)} aria-label={`Remover ${name}`}>×</button></li>)}</ul>:<p>Adicione o que você vê na geladeira ou na despensa. Não precisa informar quantidades.</p>}</div>
    {message&&<p className="inline-message" role="status">{message}</p>}
    <button className="button primary full" disabled={stage==='assembling'||stage==='checking'} onClick={generate}>{stage==='assembling'?'Montando uma sugestão…':stage==='checking'?'Verificando a sugestão…':'Gerar refeição'}</button>
   </section>

   <section className={`meal-result ${result?'has-result':''}`} aria-live="polite"><div className="result-empty" hidden={Boolean(result)}><span>PASSO 2</span><h2>Sua sugestão aparece aqui.</h2><p>Primeiro organizamos os ingredientes. Depois verificamos segurança e variedade antes de mostrar o resultado.</p><div className="empty-plate" aria-hidden="true"><i/><i/><i/></div></div>
    {result?.status==='blocked'&&<div className="blocked-result"><span>PRECISAMOS PARAR AQUI</span><h2>Não é seguro gerar essa sugestão.</h2><p>{result.message}</p><button className="button outline" onClick={()=>{setResult(null);setStage('idle')}}>Revisar ingredientes</button></div>}
    {result?.status==='ready'&&<div className="ready-result"><div className="result-label"><span>PRONTO</span><small>{result.source}</small></div><h2>{result.title}</h2><p className="result-note">{result.note}</p><div className="meal-foods">{result.foods.map(food=><span key={food.name}>{food.name}<small>{CATEGORY_LABELS[food.category]||'Outro'}</small></span>)}</div><div className="recipe-steps"><h3>Como preparar</h3><ol>{result.steps.map(step=><li key={step}>{step}</li>)}</ol></div>{result.missing.length>0&&<div className="missing-block"><h3>Se tiver, pode completar com</h3>{result.missing.map(item=><p key={item.category}><b>{item.label}:</b> {item.suggestions.join(', ')}</p>)}</div>}<div className="portion-note"><span>Sobre as porções</span><p>{result.portion.message}</p></div><div className="result-actions"><button className="button primary" onClick={save} disabled={Boolean(savedId)}>{savedId?'Salva':'Salvar refeição'}</button><button className="button outline" onClick={substitute}>Trocar um ingrediente</button></div><div className="feedback-row"><span>Essa ideia ajudou?</span><button className={feedback==='liked'?'selected':''} onClick={()=>react('liked')}>Sim</button><button className={feedback==='disliked'?'selected':''} onClick={()=>react('disliked')}>Ainda não</button></div></div>}
   </section>
  </div>
 </main>
}
