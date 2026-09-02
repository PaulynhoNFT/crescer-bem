import {findFood,normalizeFood} from '../nutrition/catalog.js'

const CRITICAL_TERMS=['vomitando depois de comer','não quer comer nada','nao quer comer nada','medo de engordar','parar de comer','ficar muito magro']

function matchesListedFood(name,list){
  const normalized=normalizeFood(name)
  const canonical=normalizeFood(findFood(name).name)
  return list.some(item=>{
    const listed=normalizeFood(item)
    const listedCanonical=normalizeFood(findFood(item).name)
    return listed===normalized||listed===canonical||listedCanonical===normalized||listedCanonical===canonical
  })
}

export function validateMealInput(names,{allergies=[],restrictions=[]}={}){
  const clean=names.map(name=>name.trim()).filter(Boolean)
  if(clean.length===0)return{ok:false,code:'EMPTY',message:'Adicione pelo menos um alimento para começar.'}
  const joined=normalizeFood(clean.join(' '))
  if(CRITICAL_TERMS.some(term=>joined.includes(normalizeFood(term))))return{ok:false,code:'CARE',message:'Essa situação precisa de atenção profissional. Procure um pediatra ou nutricionista antes de receber sugestões automáticas.'}
  const blocked=clean.filter(name=>matchesListedFood(name,allergies))
  if(blocked.length)return{ok:false,code:'ALLERGY',message:`Não vamos usar ${blocked.join(', ')} porque consta como alergia no perfil. Confira também os rótulos e o risco de contaminação cruzada.`}
  const restricted=clean.filter(name=>matchesListedFood(name,restrictions))
  if(restricted.length)return{ok:false,code:'RESTRICTION',message:`Não vamos usar ${restricted.join(', ')} porque consta como restrição no perfil. Escolha outro alimento disponível.`}
  return{ok:true,foods:clean.map(findFood)}
}

export const PORTION_POLICY={
  status:'reference-data-required',
  message:'Quantidades clínicas não são calculadas automaticamente. Sirva uma porção inicial confortável, permita repetir e observe os sinais de fome e saciedade. Um profissional pode orientar medidas individualizadas.'
}
