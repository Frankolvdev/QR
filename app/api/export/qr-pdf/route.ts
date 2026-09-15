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
 const qrSizeMm=Math.min(100,Math.max(10,Number(body.qrSizeMm)||30)); const pageWidthMm=Math.min(1000,Math.max(50,Number(body.pageWidthMm)||210)); const pageHeightMm=Math.min(1000,Math.max(50,Number(body.pageHeightMm)||297));
 if(!ids.length)return new NextResponse('Selecciona al menos una tarjeta',{status:400});
 const cards=await db.card.findMany({where:{id:{in:ids}},orderBy:{createdAt:'asc'}}); if(!cards.length)return new NextResponse('No se encontraron tarjetas',{status:404});
 const pdf=await PDFDocument.create(); const font=await pdf.embedFont(StandardFonts.HelveticaBold);
 const pageW=mm(pageWidthMm),pageH=mm(pageHeightMm),margin=mm(8),gap=mm(4),qr=mm(qrSizeMm),codeH=mm(5),cellW=qr+mm(4),cellH=qr+codeH+mm(3);
 const usableW=pageW-2*margin,usableH=pageH-2*margin;if(cellW>usableW||cellH>usableH)return new NextResponse('El QR no cabe en el tamaño de hoja seleccionado',{status:400});
 const cols=Math.max(1,Math.floor((usableW+gap)/(cellW+gap))); const rows=Math.max(1,Math.floor((usableH+gap)/(cellH+gap))); const perPage=cols*rows;
 for(let i=0;i<cards.length;i++){
  if(i%perPage===0)pdf.addPage([pageW,pageH]); const page=pdf.getPages()[pdf.getPageCount()-1]; const pos=i%perPage,row=Math.floor(pos/cols),col=pos%cols;
  const gridW=cols*cellW+(cols-1)*gap; const startX=(pageW-gridW)/2; const x=startX+col*(cellW+gap)+(cellW-qr)/2; const y=pageH-margin-(row+1)*cellH-row*gap+codeH+mm(1.5);
  const png=await QRCode.toBuffer(publicCardUrl(cards[i].code),{type:'png',width:900,margin:1,errorCorrectionLevel:'M'}); const img=await pdf.embedPng(png); page.drawImage(img,{x,y,width:qr,height:qr});
  const code=cards[i].code; const fs=Math.min(6.2,Math.max(4.5,qr/15)); const tw=font.widthOfTextAtSize(code,fs); page.drawText(code,{x:x+(qr-tw)/2,y:y-mm(3.8),size:fs,font,color:rgb(.05,.05,.05)});
 }
 const bytes=await pdf.save(); return new NextResponse(bytes,{headers:{'content-type':'application/pdf','content-disposition':'attachment; filename="qr-cards.pdf"','cache-control':'no-store'}});
}
