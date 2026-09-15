import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
export const COOKIE = "qr_session";
const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
export async function createSession(userId:string){
  const token=randomBytes(32).toString("hex");
  await db.session.create({data:{userId,tokenHash:hash(token)}});
  cookies().set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*365});
}
export async function currentUser(){
  const token=cookies().get(COOKIE)?.value;
  if(!token) return null;
  const session=await db.session.findUnique({where:{tokenHash:hash(token)},include:{user:true}});
  if(!session || session.revokedAt || !session.user.active) return null;
  return session.user;
}
export async function destroySession(){
  const token=cookies().get(COOKIE)?.value;
  if(token) await db.session.updateMany({where:{tokenHash:hash(token),revokedAt:null},data:{revokedAt:new Date()}});
  cookies().delete(COOKIE);
}
