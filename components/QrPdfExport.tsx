'use client';
import {useMemo,useState} from 'react';

type CardItem={id:string;code:string;businessName:string|null;batchId:string|null;batchName:string|null};
type PaperKey='A4'|'LETTER'|'LEGAL'|'A3'|'A5'|'CUSTOM';
const papers:Record<Exclude<PaperKey,'CUSTOM'>,{label:string,w:number,h:number}>={
 A4:{label:'A4 — 210 × 297 mm',w:210,h:297},
 LETTER:{label:'Carta — 215.9 × 279.4 mm',w:215.9,h:279.4},
 LEGAL:{label:'Legal/Oficio — 215.9 × 355.6 mm',w:215.9,h:355.6},
 A3:{label:'A3 — 297 × 420 mm',w:297,h:420},
 A5:{label:'A5 — 148 × 210 mm',w:148,h:210},
};
export default function QrPdfExport({cards}:{cards:CardItem[]}){
 const [selected,setSelected]=useState<string[]>([]); const [size,setSize]=useState('30'); const [paper,setPaper]=useState<PaperKey>('A4'); const [customW,setCustomW]=useState('210'); const [customH,setCustomH]=useState('297'); const [busy,setBusy]=useState(false);
 const all=useMemo(()=>cards.length>0&&selected.length===cards.length,[cards.length,selected.length]);
 const batches=useMemo(()=>Array.from(new Map(cards.filter(c=>c.batchId).map(c=>[c.batchId!,c.batchName||'Sin nombre']])).entries()),[cards]);
 function toggle(id:string){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 function selectBatch(batchId:string){setSelected(cards.filter(c=>c.batchId===batchId).map(c=>c.id))}
 const sizeNum=Number(size); const validSize=Number.isFinite(sizeNum)&&sizeNum>=10&&sizeNum<=100;
 async function download(ids:string[],label='qr-cards'){
  if(!ids.length||!validSize)return; setBusy(true);
  const p=paper==='CUSTOM'?{w:Number(customW),h:Number(customH)}:papers[paper];
  if(!p||!Number.isFinite(p.w)||!Number.isFinite(p.h)||p.w<50||p.h<50){alert('Revisa el tamaño de hoja.');setBusy(false);return}
  try{const r=await fetch('/api/export/qr-pdf',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ids,qrSizeMm:sizeNum,pageWidthMm:p.w,pageHeightMm:p.h,paper})});
   if(!r.ok)throw new Error(await r.text()); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=`${label}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(e){alert('No se pudo generar el PDF. '+(e instanceof Error?e.message:''))}finally{setBusy(false)}
 }
 return <>
  <div className="exportBar v9"><div><b>Exportar QR para imprenta</b><span>El valor en mm es el lado del QR cuadrado. El código único va debajo y queda fuera de esa medida. El PDF conserva medidas físicas reales.</span></div>
   <label>Lado del QR <span><input inputMode="decimal" value={size} onChange={e=>setSize(e.target.value.replace(/[^0-9.]/g,''))} onBlur={()=>{if(!validSize)setSize('30')}}/> mm</span></label>
   <label>Tamaño de hoja <select value={paper} onChange={e=>setPaper(e.target.value as PaperKey)}>{Object.entries(papers).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}<option value="CUSTOM">Personalizada</option></select></label>
   {paper==='CUSTOM'&&<div className="customPaper"><label>Ancho mm<input value={customW} onChange={e=>setCustomW(e.target.value.replace(/[^0-9.]/g,''))}/></label><label>Alto mm<input value={customH} onChange={e=>setCustomH(e.target.value.replace(/[^0-9.]/g,''))}/></label></div>}
   <button className="primaryBtn" disabled={!selected.length||busy||!validSize} onClick={()=>download(selected,'qr-seleccion')}>{busy?'Generando…':`Exportar seleccionados (${selected.length})`}</button></div>
  <div className="selectAll"><div className="selectionActions"><label><input type="checkbox" checked={all} onChange={()=>setSelected(all?[]:cards.map(c=>c.id))}/> Seleccionar todas las tarjetas visibles</label>{batches.length>0&&<select defaultValue="" onChange={e=>{if(e.target.value)selectBatch(e.target.value)}}><option value="">Seleccionar un lote…</option>{batches.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>}</div><small>Hoja configurable · tamaño real · acomodo automático</small></div>
  <div className="tableWrap exportTable"><table><thead><tr><th className="checkCol"></th><th>Preview QR / Código</th><th>Lote</th><th>Negocio</th><th>PDF individual</th></tr></thead><tbody>{cards.map(c=><tr key={c.id}><td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>toggle(c.id)}/></td><td><div className="qrCell"><img src={`/api/qr/${c.code}`} alt={`QR ${c.code}`}/><div><b>{c.code}</b><small>Este código se imprime debajo</small></div></div></td><td>{c.batchName||'—'}</td><td>{c.businessName||'—'}</td><td><button type="button" className="miniBtn" disabled={busy||!validSize} onClick={()=>download([c.id],`qr-${c.code}`)}>Exportar PDF</button></td></tr>)}</tbody></table></div>
 </>
}
