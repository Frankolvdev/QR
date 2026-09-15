'use client';
import {useEffect,useRef,useState} from 'react';

function extractCode(raw:string){
  const text=raw.trim();
  try{const u=new URL(text);const parts=u.pathname.split('/').filter(Boolean);const i=parts.findIndex(x=>x==='r');if(i>=0&&parts[i+1])return decodeURIComponent(parts[i+1]).toUpperCase()}catch{}
  return text.toUpperCase();
}
export default function QrScanner({onCode}:{onCode:(code:string)=>void}){
 const video=useRef<HTMLVideoElement>(null); const stream=useRef<MediaStream|null>(null); const [open,setOpen]=useState(false); const [msg,setMsg]=useState('');
 useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);
 async function start(){
   setMsg(''); setOpen(true);
   try{
    const Detector=(window as any).BarcodeDetector;
    if(!Detector) throw new Error('Tu navegador no soporta el lector automático. Usa Chrome actualizado o escribe el código manualmente.');
    stream.current=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}});
    if(video.current){video.current.srcObject=stream.current;await video.current.play()}
    const detector=new Detector({formats:['qr_code']});
    const loop=async()=>{if(!stream.current)return;try{const found=await detector.detect(video.current);if(found?.[0]?.rawValue){const code=extractCode(found[0].rawValue);stop();onCode(code);return}}catch{}requestAnimationFrame(loop)};requestAnimationFrame(loop);
   }catch(e:any){setMsg(e?.message||'No se pudo abrir la cámara. Revisa los permisos.');stream.current?.getTracks().forEach(t=>t.stop());stream.current=null}
 }
 function stop(){stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setOpen(false)}
 return <><button type="button" className="scanBtn cameraBtn" onClick={start}>▣ Escanear QR</button>{open&&<div className="scannerModal"><div className="scannerBox"><div className="scannerHead"><b>Escanea el QR de la tarjeta</b><button type="button" onClick={stop}>×</button></div><div className="cameraFrame"><video ref={video} playsInline muted/><span className="scanFrame"/></div><p>Coloca el QR dentro del recuadro. Se leerá automáticamente.</p>{msg&&<div className="errorBox">{msg}</div>}<button type="button" className="ghostBtn fullBtn" onClick={stop}>Cancelar</button></div></div>}</>
}
