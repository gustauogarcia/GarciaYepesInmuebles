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

## Inicio de sesión

La app ahora pide iniciar sesión antes de mostrar cualquier información
(antes cualquiera con el link podía ver y editar los datos). El acceso se
maneja desde Supabase, no desde el código:

1. En el panel de Supabase: **Authentication > Users > Add user > Invite
   user**, con tu correo.
2. Te llega un correo de Supabase para elegir tu propia contraseña. Ese
   correo y esa contraseña son los que usas para entrar en
   `https://garcia-yepes-inmuebles.vercel.app/login`.
3. Si en el futuro necesitas dar acceso a alguien más (ej. un administrador
   de confianza), repites el mismo paso con su correo — no hace falta tocar
   el código.

Nadie más puede ver ni modificar los datos sin haber iniciado sesión.
