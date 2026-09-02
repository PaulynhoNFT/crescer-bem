import {supabase} from '../lib/supabase'

const ALLOWED=new Set(['landing_viewed','generator_started','ingredient_added','meal_generated','meal_saved','meal_rejected','substitution_requested','pantry_created','weekly_menu_created','shopping_list_created','account_created','whatsapp_opted_in','whatsapp_opted_out','return_7d','return_30d'])
const BLOCKED_KEYS=['child','name','nickname','weight','height','growth','allergy','ingredient','food','clinical']

function safeMetadata(input={}){
  return Object.fromEntries(Object.entries(input).filter(([key,value])=>!BLOCKED_KEYS.some(blocked=>key.toLowerCase().includes(blocked))&&['string','number','boolean'].includes(typeof value)).slice(0,8))
}

function sessionId(){
  if(typeof window==='undefined')return null
  let value=localStorage.getItem('ai-labs-session-id')
  if(!value){
    if(typeof window.crypto?.randomUUID==='function')value=window.crypto.randomUUID()
    else{
      const bytes=new Uint8Array(16)
      if(typeof window.crypto?.getRandomValues==='function')window.crypto.getRandomValues(bytes)
      else for(let index=0;index<bytes.length;index++)bytes[index]=Math.floor(Math.random()*256)
      bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128
      const hex=[...bytes].map(byte=>byte.toString(16).padStart(2,'0'))
      value=`${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10).join('')}`
    }
    localStorage.setItem('ai-labs-session-id',value)
  }
  return value
}

export async function track(eventName,{userId=null,metadata={}}={}){
  if(!ALLOWED.has(eventName)||typeof window==='undefined')return
  const event={event_name:eventName,session_id:sessionId(),metadata:safeMetadata(metadata),occurred_at:new Date().toISOString()}
  if(userId&&supabase){await supabase.from('product_events').insert({...event,user_id:userId});return}
  const queue=JSON.parse(localStorage.getItem('ai-labs-event-queue')||'[]').slice(-30)
  queue.push(event)
  localStorage.setItem('ai-labs-event-queue',JSON.stringify(queue))
}

export async function flushEvents(userId){
  if(!userId||!supabase||typeof window==='undefined')return
  const queue=JSON.parse(localStorage.getItem('ai-labs-event-queue')||'[]')
  if(!queue.length)return
  const {error}=await supabase.from('product_events').insert(queue.map(event=>({...event,user_id:userId})))
  if(!error)localStorage.removeItem('ai-labs-event-queue')
}

export async function trackReturnMilestones(user){
  if(!user?.id||typeof window==='undefined')return
  const key=`ai-labs-return-milestones:${user.id}`
  const state=JSON.parse(localStorage.getItem(key)||'{}')
  const accountAgeDays=(Date.now()-new Date(user.created_at).getTime())/86400000
  const milestones=[]
  if(accountAgeDays>=7&&!state.day7){state.day7=true;milestones.push('return_7d')}
  if(accountAgeDays>=30&&!state.day30){state.day30=true;milestones.push('return_30d')}
  state.last_seen_at=new Date().toISOString()
  localStorage.setItem(key,JSON.stringify(state))
  for(const eventName of milestones)await track(eventName,{userId:user.id})
}
