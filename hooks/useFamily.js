'use client'

import {useCallback,useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'

export function useFamily(session){
  const [children,setChildren]=useState([])
  const [activeId,setActiveId]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  const refresh=useCallback(async()=>{
    if(!session||!supabase){setChildren([]);setActiveId(null);return}
    setLoading(true);setError('')
    const {data,error:queryError}=await supabase.from('children').select('id,nickname,birth_date,sex_for_growth_reference,allergies,intolerances,dislikes,created_at').eq('parent_id',session.user.id).order('created_at')
    if(queryError){setError('Não foi possível carregar os perfis agora.');setLoading(false);return}
    setChildren(data||[])
    const stored=localStorage.getItem('ai-labs-active-child')
    const next=(data||[]).some(item=>item.id===stored)?stored:data?.[0]?.id||null
    setActiveId(next);setLoading(false)
  },[session])

  useEffect(()=>{refresh()},[refresh])
  const select=id=>{setActiveId(id);localStorage.setItem('ai-labs-active-child',id)}
  return{children,activeChild:children.find(child=>child.id===activeId)||null,activeId,select,refresh,loading,error}
}
