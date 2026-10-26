# ÑE’ÊTECH UEP – Cómo publicar en Cloudflare Pages

## 1. Subir el sitio
Workers & Pages → Create → Pages → "Upload assets" → nombre del proyecto → subir esta carpeta (o el .zip) → Deploy.
Si el panel no detecta la carpeta `functions` (el admin no funcionaría), usa una de estas alternativas:
- Subir los archivos a un repositorio de GitHub y conectarlo (Connect to Git; sin build command, output directory `/`).
- O desde la terminal: `npx wrangler pages deploy . --project-name neetech-uep`

## 2. Crear el almacén KV (sin R2)
Storage & Databases → KV → Create namespace → `neetech-uep`.
Proyecto Pages → Settings → Bindings → Add → KV namespace → nombre de variable: `NEETECH_KV` → elegir el namespace.

## 3. Usuario y contraseña del admin
Settings → Variables and Secrets → agregar (tipo Secret):
- `ADMIN_USER` = tu usuario
- `ADMIN_PASS` = una contraseña larga
- `SESSION_SECRET` = una cadena aleatoria larga (30+ caracteres)

## 4. Volver a desplegar
Deployments → Retry deployment (o subir de nuevo) para que tome el KV y las variables.

## 5. Usar
Administración: https://TU-PROYECTO.pages.dev/admin/
Subir archivos a Google Drive → Compartir como "Cualquier persona con el enlace" (Lector) → pegar el enlace en el panel.
Los ejemplos iniciales se pueden editar o eliminar desde el panel.
