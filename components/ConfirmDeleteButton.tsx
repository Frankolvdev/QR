'use client';
export default function ConfirmDeleteButton({disabled=false,label='Eliminar',message='¿Seguro que deseas eliminar esta cuenta?'}:{disabled?:boolean;label?:string;message?:string}){
  return <button type="submit" className="dangerBtn" disabled={disabled} title={disabled?'No puedes eliminar tu propia cuenta':''} onClick={(e)=>{if(!disabled&&!window.confirm(message))e.preventDefault();}}>{label}</button>;
}
