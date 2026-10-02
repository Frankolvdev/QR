import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';

export async function POST(req:Request){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'No autorizado'},{status:401});
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key)return NextResponse.json({error:'Google Places no está configurado.'},{status:503});
  const body=await req.json().catch(()=>({}));
  const query=String(body?.query||'').trim();
  if(query.length<2)return NextResponse.json({places:[]});
  try{
    const response=await fetch('https://places.googleapis.com/v1/places:searchText',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'X-Goog-Api-Key':key,
        'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress'
      },
      body:JSON.stringify({textQuery:query,languageCode:'es',regionCode:'MX',maxResultCount:8}),
      cache:'no-store'
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)return NextResponse.json({error:data?.error?.message||'Google Places no pudo completar la búsqueda.'},{status:502});
    const places=(data.places||[]).map((p:any)=>({
      id:p.id,
      name:p.displayName?.text||'Negocio',
      address:p.formattedAddress||''
    })).filter((p:any)=>p.id);
    return NextResponse.json({places});
  }catch{
    return NextResponse.json({error:'No se pudo conectar con Google Places.'},{status:502});
  }
}
