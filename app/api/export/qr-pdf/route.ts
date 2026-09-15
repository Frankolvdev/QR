import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/auth';
import {db} from '@/lib/db';
import {publicCardUrl} from '@/lib/codes';
import QRCode from 'qrcode';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';

const mm=(n:number)=>n*72/25.4;
export async function POST(req:Request){
 const u=await currentUser(); if(!u||u.role!=='ADMIN')return new NextResponse('No autorizado',{status:401});
 const body=await req.json().catch(()=>({})); const ids=Array.isArray(body.ids)?body.ids.filter((x:unknown)=>typeof x==='string').slice(0,500):[];
 const qrSizeMm=Math.min(70,Math.max(15,Number(body.qrSizeMm)||30)); if(!ids.length)return new NextResponse('Selecciona al menos una tarjeta',{status:400});
 const cards=await db.card.findMany({where:{id:{in:ids}},orderBy:{createdAt:'asc'}}); if(!cards.length)return new NextResponse('No se encontraron tarjetas',{status:404});
 const pdf=await PDFDocument.create(); const font=await pdf.embedFont(StandardFonts.HelveticaBold); const regular=await pdf.embedFont(StandardFonts.Helvetica);
 const pageW=mm(210),pageH=mm(297),margin=mm(10),gap=mm(5),qr=mm(qrSizeMm),codeH=mm(8),cellW=qr+mm(6),cellH=qr+codeH+mm(5);
 const cols=Math.max(1,Math.floor((pageW-2*margin+gap)/(cellW+gap))); const rows=Math.max(1,Math.floor((pageH-2*margin+gap)/(cellH+gap))); const perPage=cols*rows;
 for(let i=0;i<cards.length;i++){
  if(i%perPage===0)pdf.addPage([pageW,pageH]); const page=pdf.getPages()[pdf.getPageCount()-1]; const pos=i%perPage,row=Math.floor(pos/cols),col=pos%cols;
  const x=margin+col*(cellW+gap)+(cellW-qr)/2; const y=pageH-margin-(row+1)*cellH-row*gap+codeH+mm(2);
  const png=await QRCode.toBuffer(publicCardUrl(cards[i].code),{type:'png',width:900,margin:1,errorCorrectionLevel:'M'}); const img=await pdf.embedPng(png); page.drawImage(img,{x,y,width:qr,height:qr});
  const code=cards[i].code; const fs=Math.min(11,qr/7); const tw=font.widthOfTextAtSize(code,fs); page.drawText(code,{x:x+(qr-tw)/2,y:y-mm(5),size:fs,font,color:rgb(.05,.05,.05)});
  const tiny=`QR ${qrSizeMm} mm`; const ts=5.5,tt=regular.widthOfTextAtSize(tiny,ts); page.drawText(tiny,{x:x+(qr-tt)/2,y:y-mm(7.2),size:ts,font:regular,color:rgb(.45,.45,.45)});
 }
 const bytes=await pdf.save(); return new NextResponse(bytes,{headers:{'content-type':'application/pdf','content-disposition':'attachment; filename="qr-cards.pdf"','cache-control':'no-store'}});
}
