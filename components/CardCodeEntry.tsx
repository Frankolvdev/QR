'use client';
import {useState} from 'react';import QrScanner from './QrScanner';
export default function CardCodeEntry(){const [code,setCode]=useState('');return <><label>Código de tarjeta</label><div className="codeRow"><input className="input" name="code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Ej. A7K9-P2MX" autoFocus required/><QrScanner onCode={setCode}/></div><p className="fieldHelp">Puedes escanear el QR con la cámara o escribir el código impreso debajo.</p></>}
