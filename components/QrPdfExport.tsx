'use client';
import {useMemo,useState} from 'react';

type CardItem={id:string;code:string;businessName:string|null};

export default function QrPdfExport({cards}:{cards:CardItem[]}){
 const [selected,setSelected]=useState<string[]>([]); const [size,setSize]=useState(30); const [busy,setBusy]=useState(false);
 const all=useMemo(()=>cards.length>0&&selected.length===cards.length,[cards.length,selected.length]);
 function toggle(id:string){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 async function download(ids:string[],label='qr-cards'){
  if(!ids.length)return; setBusy(true);
  try{const r=await fetch('/api/export/qr-pdf',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids,qrSizeMm:size})});
   if(!r.ok)throw new Error(await r.text()); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=`${label}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(e){alert('No se pudo generar el PDF. '+(e instanceof Error?e.message:''))}finally{setBusy(false)}
 }
 return <>
  <div className="exportBar"><div><b>Exportar QR para imprenta</b><span>Elige el tamaño físico del QR. El código único se imprime debajo.</span></div><label>Tamaño QR <span><input type="number" min="15" max="70" step="1" value={size} onChange={e=>setSize(Number(e.target.value))}/> mm</span></label><button className="primaryBtn" disabled={!selected.length||busy} onClick={()=>download(selected,'qr-seleccion')}>{busy?'Generando…':`Exportar seleccionados (${selected.length})`}</button></div>
  <div className="selectAll"><label><input type="checkbox" checked={all} onChange={()=>setSelected(all?[]:cards.map(c=>c.id))}/> Seleccionar todas las tarjetas visibles</label><small>PDF A4 · medidas reales en milímetros · distribución automática</small></div>
  <div className="tableWrap"><table><thead><tr><th className="checkCol"></th><th>QR / Código</th><th>Negocio</th><th>PDF individual</th></tr></thead><tbody>{cards.map(c=><tr key={c.id}><td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggle(c.id)}/></td><td><b>{c.code}</b></td><td>{c.businessName||'—'}</td><td><button type="button" className="miniBtn" disabled={busy} onClick={()=>download([c.id],`qr-${c.code}`)}>Exportar PDF</button></td></tr>)}</tbody></table></div>
 </>
}
