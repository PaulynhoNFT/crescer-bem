export const FOOD_CATALOG = [
  {name:'Arroz',category:'grain',aliases:['arroz branco','arroz integral']},
  {name:'Feijão',category:'legume',aliases:['feijao','feijão preto','feijão carioca']},
  {name:'Ovo',category:'protein',aliases:['ovos']},
  {name:'Frango',category:'protein',aliases:['peito de frango','frango assado']},
  {name:'Carne',category:'protein',aliases:['carne bovina','patinho']},
  {name:'Sardinha',category:'protein',aliases:['sardinhas']},
  {name:'Lentilha',category:'legume',aliases:['lentilhas']},
  {name:'Macarrão',category:'grain',aliases:['macarrao','massa']},
  {name:'Batata',category:'grain',aliases:['batata inglesa']},
  {name:'Mandioca',category:'grain',aliases:['aipim','macaxeira']},
  {name:'Aveia',category:'grain',aliases:['flocos de aveia']},
  {name:'Pão',category:'grain',aliases:['pao','pão francês','pão integral']},
  {name:'Tomate',category:'vegetable',aliases:['tomates']},
  {name:'Cenoura',category:'vegetable',aliases:['cenouras']},
  {name:'Alface',category:'vegetable',aliases:['folhas']},
  {name:'Brócolis',category:'vegetable',aliases:['brocolis']},
  {name:'Abóbora',category:'vegetable',aliases:['abobora']},
  {name:'Banana',category:'fruit',aliases:['bananas']},
  {name:'Maçã',category:'fruit',aliases:['maca','maçãs']},
  {name:'Mamão',category:'fruit',aliases:['mamao']},
  {name:'Laranja',category:'fruit',aliases:['laranjas']},
  {name:'Leite',category:'dairy',aliases:['leite integral']},
  {name:'Queijo',category:'dairy',aliases:['muçarela','mussarela']},
  {name:'Iogurte',category:'dairy',aliases:['iogurte natural']},
]

export const CATEGORY_LABELS={grain:'Base',legume:'Leguminosa',protein:'Proteína',vegetable:'Vegetal',fruit:'Fruta',dairy:'Laticínio',other:'Outro'}

export function normalizeFood(value=''){
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ')
}

export function findFood(value){
  const normalized=normalizeFood(value)
  return FOOD_CATALOG.find(food=>[food.name,...food.aliases].some(alias=>normalizeFood(alias)===normalized))||{name:value.trim(),category:'other',aliases:[]}
}

export function suggestionsFor(category,excluded=[]){
  const blocked=new Set(excluded.map(normalizeFood))
  return FOOD_CATALOG.filter(food=>food.category===category&&!blocked.has(normalizeFood(food.name))).slice(0,4)
}
