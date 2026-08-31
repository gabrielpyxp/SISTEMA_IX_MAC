# SISTEMA IX MAC - Encontro MAC Minimercado

Mobile-first - Cores: Bordô #5C161B e Dourado #FACC15

## Estrutura
```
/backend  -> Node.js + Express + PostgreSQL (Neon)
/frontend -> React + Vite + Tailwind + Axios
```

## Rodar local

### 1. Banco (Neon)
- Crie projeto em https://neon.tech
- Copie `DATABASE_URL`
- Rode `backend/sql/schema.sql` no SQL Editor do Neon

### 2. Backend
```bash
cd backend
cp .env.example .env  # preencha DATABASE_URL e JWT_SECRET
npm install
npm run dev  # http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

### Criar usuário inicial
```bash
# Com backend rodando, gere hash:
node -e "import('bcryptjs').then(async m=>console.log(await m.hash('mac123',10)))"
# Use POST /api/auth/register
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"nome":"Admin","email":"admin@mac.com","senha":"mac123"}'
```

### Deploy
- **Frontend Vercel**: Root Directory = `frontend`, Build `npm run build`, Env `VITE_API_URL=https://<railway-url>/api`
- **Backend Railway**: Root Directory = `backend`, Start `npm start`, Envs: DATABASE_URL, JWT_SECRET, FRONTEND_URL, PORT
- **Neon**: já hospedado

## Endpoints
- POST /api/auth/login, POST /api/auth/register, GET /api/auth/me
- GET/POST /api/produtos, PUT/DELETE /api/produtos/:id
- POST/GET /api/vendas, PUT /api/vendas/:id/status
- GET /api/dashboard
- GET /api/health
