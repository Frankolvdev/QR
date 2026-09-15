export default function Logo({compact=false}:{compact?:boolean}){
  return <div className="brand"><span className="brandMark" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M8 8h14v6H14v8H8V8Zm18 0h14v14h-6v-8h-8V8ZM8 26h6v8h8v6H8V26Zm26 0h6v14H26v-6h8v-8Z"/><path d="M19 19h10v10H19z"/></svg></span>{!compact&&<span className="brandText"><b>QR CONNECT</b><small>SMART CARDS</small></span>}</div>
}
