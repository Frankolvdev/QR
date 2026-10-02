import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';

export async function POST(req:Request){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'No autorizado'},{status:401});
  const key=process.env.GOOGLE_MAPS_API_KEY;
  if(!key)return NextResponse.json({error:'Google Places no está configurado.'},{status:503});
  const body=await req.json().catch(()=>({}));
  const placeId=String(body?.placeId||'').trim();
  if(!placeId||!/^[A-Za-z0-9_-]+$/.test(placeId))return NextResponse.json({error:'Negocio no válido.'},{status:400});
  try{
    const response=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,{
      headers:{
        'X-Goog-Api-Key':key,
        'X-Goog-FieldMask':'id,displayName,formattedAddress,googleMapsLinks.writeAReviewUri'
      },
      cache:'no-store'
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)return NextResponse.json({error:data?.error?.message||'No se pudo obtener el enlace de reseña.'},{status:502});
    const reviewUrl=data?.googleMapsLinks?.writeAReviewUri;
    if(!reviewUrl)return NextResponse.json({error:'Google no devolvió un enlace para escribir reseña para este negocio.'},{status:404});
    return NextResponse.json({
      placeId:data.id||placeId,
      name:data.displayName?.text||'',
      address:data.formattedAddress||'',
      reviewUrl
    });
  }catch{
    return NextResponse.json({error:'No se pudo conectar con Google Places.'},{status:502});
  }
}
