import Brand from './Brand'

export default function SiteFooter({onNavigate}){
 return <footer className="site-footer"><div><Brand/><p>Assistente gratuito para transformar o que já existe em casa em refeições possíveis para a rotina familiar.</p></div><nav aria-label="Rodapé"><button onClick={()=>onNavigate('generator')}>Gerador</button><button onClick={()=>onNavigate('resources')}>Segurança</button><button onClick={()=>onNavigate('auth')}>Conta</button></nav><small>Orientação educativa. Não substitui avaliação de pediatra ou nutricionista.</small><small>© {new Date().getFullYear()} AI LABS</small></footer>
}
