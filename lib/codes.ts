import { randomBytes } from "crypto";
const ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeCardCode(){const b=randomBytes(8);let s="";for(let i=0;i<8;i++)s+=ALPHABET[b[i]%ALPHABET.length];return s.slice(0,4)+"-"+s.slice(4)}
export function publicCardUrl(code:string){return `${process.env.APP_URL||'http://localhost:4600'}/r/${encodeURIComponent(code)}`}
