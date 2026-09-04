# Blanco y Negro — app de administración

Aplicación web (Next.js) conectada a la base de datos real del edificio en
Supabase. Reemplaza, paso a paso, el archivo de Excel que se usaba antes.

## Antes de empezar

Este proyecto necesita conectarse a tu base de datos de Supabase. Copia el
archivo `.env.local.example` como `.env.local` (mismo folder) y completa los
dos valores con los de tu proyecto de Supabase:

```
Project Settings > API > Project URL          → NEXT_PUBLIC_SUPABASE_URL
Project Settings > API > anon / public key    → NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`.env.local` nunca se sube a GitHub (está en `.gitignore`) — así tu llave no
queda expuesta.

## Probar en tu computadora (opcional)

Si tienes Node.js instalado:

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — deberías ver el resumen del edificio (unidades,
movimientos, saldo de caja) leído directamente de Supabase.

## Publicar en internet (Vercel)

No hace falta correr nada en tu computadora para esto. En Vercel:

1. "Add New… > Project" y elige este repositorio de GitHub.
2. En "Environment Variables", agrega las mismas dos variables de arriba
   (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. "Deploy". En un par de minutos la app queda publicada en una dirección
   web pública.

Cada vez que se suba una actualización del código a GitHub, Vercel vuelve a
publicar la app sola — no hay que repetir estos pasos.
