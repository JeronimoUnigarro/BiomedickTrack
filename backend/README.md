# BiomedicTrack Backend FastAPI

Backend modular en FastAPI + SQLAlchemy + MySQL, compatible con el frontend React existente.

## Contrato principal

Todas las respuestas usadas por el frontend mantienen esta forma:

```json
{ "success": true, "data": {} }
```

Errores:

```json
{ "success": false, "error": "Mensaje" }
```

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/recover`
- `POST /api/auth/reset-password`
- `GET/POST /api/usuarios`
- `PUT/DELETE /api/usuarios/{id}`
- `GET/POST /api/equipos`
- `GET/PUT/DELETE /api/equipos/{id}`
- `GET/POST /api/mantenimientos`
- `PUT/DELETE /api/mantenimientos/{id}`
- `GET /api/alertas`
- `PUT /api/alertas`
- `PUT /api/alertas/{id}`
- `GET /api/bitacora`
- `GET /api/dashboard/stats`

## Ejecucion local

1. Crear base de datos MySQL:

```sql
CREATE DATABASE biomedictrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'biomedic'@'localhost' IDENTIFIED BY 'biomedic';
GRANT ALL PRIVILEGES ON biomedictrack.* TO 'biomedic'@'localhost';
FLUSH PRIVILEGES;
```

2. Crear entorno Python e instalar:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

3. Migrar y sembrar datos:

```bash
alembic upgrade head
python scripts/seed.py
```

4. Levantar API en el puerto esperado por el frontend:

```bash
uvicorn app.main:app --reload --port 3000
```

5. Levantar frontend:

```bash
cd ../frontend
npm run dev
```

Swagger queda disponible en `http://localhost:3000/docs`.

## Credenciales seed

- Gerencia: `admin@hospital.com` / `Admin123`
- Biomedico: `ingeniero@hospital.com` / `Ingeniero123`
- Codigo 2FA local: `123456`

## Seguridad

- Cambiar `JWT_SECRET_KEY` en produccion.
- Dejar `DEV_2FA_CODE` vacio para generar codigos aleatorios.
- Usar HTTPS y restringir `CORS_ORIGINS`.
- Usar usuario MySQL con permisos limitados.
- No versionar `.env`.
