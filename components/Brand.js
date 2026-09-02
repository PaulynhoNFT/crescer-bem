export default function Brand({compact=false}){
  return <span className="brand-lockup" aria-label="AI LABS — alimentação em família"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>{!compact&&<span><b>AI LABS</b><small>alimentação em família</small></span>}</span>
}
