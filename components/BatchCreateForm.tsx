'use client';
import {useEffect,useState} from 'react';

function todayName(){
  const d=new Date();
  return `Lote ${new Intl.DateTimeFormat('es-MX',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d)}`;
}

export default function BatchCreateForm({action}:{action:(fd:FormData)=>void|Promise<void>}){
  const [name,setName]=useState('');
  useEffect(()=>{setName(todayName())},[]);
  return <form action={action}>
    <label>Nombre del lote</label>
    <input className="input" name="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Lote 15/09/2026" required/>
    <label>Cantidad</label>
    <input className="input" name="quantity" type="number" min="1" max="500" defaultValue="10" required/>
    <button className="primaryBtn full">Generar códigos QR</button>
  </form>;
}
