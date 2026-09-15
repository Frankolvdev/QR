# QR System V3 SQLITE FIXED

Sistema independiente para tarjetas PVC con QR dinámico y NFC.

## Compatibilidad
- Desarrollo: Node.js >= 18.17 y < 21
- Servidor objetivo: Node.js 18.20.8 / npm 10.8.2
- Next.js 14.2.35
- SQLite + Prisma 5.22
- Puerto previsto: 4600
- Dominio previsto: qr.riandamd.com

## Aislamiento
Este proyecto NO usa MongoDB y no depende de `riandamd_backend` ni `riandamd_app`.
No requiere actualizar Node, npm, PM2 o Nginx del servidor.

## Windows / PowerShell
Desde la raíz del proyecto:

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Abrir: http://localhost:4600

Admin de desarrollo:
- email: admin@local.test
- password: ChangeMe123!

Cambia `SESSION_SECRET` en `.env` antes de usarlo fuera de desarrollo.

## Nota
No ejecutar `npm audit fix --force`. Puede introducir cambios mayores incompatibles.


## V3
Los campos `role` y `status` son String porque Prisma 5.22 + SQLite no soporta enums nativos. La aplicación conserva los valores controlados ADMIN/SELLER y AVAILABLE/IN_REGISTRATION/ACTIVE/DISABLED/REPLACED.
