import {CATEGORY_LABELS,suggestionsFor} from '../nutrition/catalog.js'
import {PORTION_POLICY,validateMealInput} from '../safety/validateMeal.js'

const REQUIRED=['grain','protein','vegetable']

function titleFor(foods){
  const names=foods.map(food=>food.name)
  if(names.includes('Arroz')&&names.includes('Feijão'))return `Prato de arroz e feijão com ${names.find(name=>!['Arroz','Feijão'].includes(name))||'acompanhamentos'}`
  if(names.includes('Aveia')&&names.includes('Banana'))return 'Creme de banana com aveia'
  if(names.includes('Pão')&&names.includes('Ovo'))return 'Pão com ovo e acompanhamento fresco'
  return `Refeição simples com ${names.slice(0,3).join(', ')}`
}

export function generateMeal(names,profile){
  const validation=validateMealInput(names,profile)
  if(!validation.ok)return{status:'blocked',...validation}
  const foods=validation.foods
  const categories=new Set(foods.map(food=>food.category))
  const missing=REQUIRED.filter(category=>!categories.has(category)).map(category=>({category,label:CATEGORY_LABELS[category],suggestions:suggestionsFor(category,names).map(food=>food.name)}))
  const steps=[
    `Separe e higienize ${foods.filter(food=>['vegetable','fruit'].includes(food.category)).map(food=>food.name.toLowerCase()).join(' e ')||'os alimentos frescos'}.`,
    'Aqueça ou prepare os ingredientes usando pouco sal e temperos da rotina da família.',
    'Monte o prato com variedade, sem pressionar a criança a terminar tudo.',
  ]
  return{
    status:'ready',
    title:titleFor(foods),
    foods,
    missing,
    steps,
    portion:PORTION_POLICY,
    note:missing.length?'A refeição já pode funcionar; as sugestões abaixo ajudam a aumentar a variedade quando estiverem disponíveis.':'A combinação reúne uma base, uma fonte de proteína e alimentos frescos.',
    source:'Motor local de composição — sem cálculo clínico e sem IA generativa.',
  }
}
