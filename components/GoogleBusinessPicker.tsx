'use client';
import {useState} from 'react';

type Place={id:string;name:string;address:string};
export default function GoogleBusinessPicker({defaultBusinessName='',defaultUrl='',nameField='businessName',urlField='destinationUrl'}:{defaultBusinessName?:string;defaultUrl?:string;nameField?:string;urlField?:string}){
  const [query,setQuery]=useState(defaultBusinessName);
  const [places,setPlaces]=useState<Place[]>([]);
  const [businessName,setBusinessName]=useState(defaultBusinessName);
  const [url,setUrl]=useState(defaultUrl);
  const [selected,setSelected]=useState<Place|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function search(){
    const q=query.trim(); if(q.length<2){setError('Escribe el nombre del negocio y, de ser posible, la ciudad.');return}
    setBusy(true);setError('');setPlaces([]);setSelected(null);
    try{
      const r=await fetch('/api/google-places/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error||'No se pudo buscar.');
      setPlaces(d.places||[]); if(!(d.places||[]).length)setError('No encontramos coincidencias. Prueba agregando ciudad, colonia o dirección.');
    }catch(e:any){setError(e.message||'No se pudo buscar el negocio.')}finally{setBusy(false)}
  }
  async function choose(place:Place){
    setBusy(true);setError('');
    try{
      const r=await fetch('/api/google-places/review-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:place.id})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error||'No se pudo obtener el enlace.');
      setSelected({...place,name:d.name||place.name,address:d.address||place.address});
      setBusinessName(d.name||place.name);setUrl(d.reviewUrl);setPlaces([]);setQuery(d.name||place.name);
    }catch(e:any){setError(e.message||'No se pudo obtener el enlace de reseña.')}finally{setBusy(false)}
  }
  return <div className="googleBusinessPicker">
    <label>Buscar negocio en Google</label>
    <div className="googleSearchRow"><input className="input" value={query} onChange={e=>{setQuery(e.target.value);if(!selected)setBusinessName(e.target.value)}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search()}}} placeholder="Ej. Restaurante El Patio, Tulancingo"/><button type="button" className="ghostBtn" onClick={search} disabled={busy}>{busy?'Buscando…':'Buscar'}</button></div>
    <p className="fieldHelp">Busca y selecciona el negocio correcto. El sistema obtendrá automáticamente el enlace oficial para escribir una reseña.</p>
    {error&&<div className="googlePlaceError">{error}</div>}
    {places.length>0&&<div className="googlePlaceResults">{places.map(p=><button type="button" key={p.id} onClick={()=>choose(p)} disabled={busy}><b>{p.name}</b><span>{p.address||'Sin dirección disponible'}</span></button>)}</div>}
    {selected&&<div className="googlePlaceSelected"><b>✓ {selected.name}</b><span>{selected.address}</span><small>Enlace de reseña de Google listo.</small></div>}
    <input type="hidden" name={nameField} value={businessName}/>
    <label>Enlace de reseña / destino</label>
    <input className="input" name={urlField} type="url" value={url} onChange={e=>{setUrl(e.target.value);setSelected(null)}} placeholder="Selecciona un negocio arriba o pega una URL https://..." required/>
    <p className="fieldHelp">También puedes pegar una URL manualmente si la tarjeta no debe dirigir a reseñas de Google.</p>
  </div>
}
