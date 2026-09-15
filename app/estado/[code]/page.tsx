import {db} from '@/lib/db';
import Logo from '@/components/Logo';

const info:Record<string,{title:string;text:string}>={
 DISABLED:{title:'Esta tarjeta está inactiva',text:'El administrador desactivó temporalmente esta tarjeta. Por seguridad, no se abrirá el enlace configurado.'},
 REPLACED:{title:'Esta tarjeta fue reemplazada',text:'Esta tarjeta ya no está en servicio. Solicita al establecimiento su tarjeta actual.'},
 AVAILABLE:{title:'Tarjeta aún no configurada',text:'Esta tarjeta todavía no ha sido registrada por un vendedor.'},
 IN_REGISTRATION:{title:'Configuración en proceso',text:'Esta tarjeta está siendo configurada. Intenta nuevamente cuando el registro haya terminado.'}
};
export default async function StatusPage({params}:{params:{code:string}}){const card=await db.card.findUnique({where:{code:params.code}});const data=card?info[card.status]:null;return <main className="publicStatusPage"><div className="publicStatusCard"><Logo/><div className="alertMark">!</div><span className="eyebrow">ESTADO DE TARJETA</span><h1>{data?.title||'Tarjeta no disponible'}</h1><p>{data?.text||'No encontramos una tarjeta válida con este código.'}</p><div className="publicCode">{params.code}</div><small>Si crees que esto es un error, contacta al negocio o al administrador de la tarjeta.</small></div></main>}
