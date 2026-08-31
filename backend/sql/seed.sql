-- Seed de usuário com senha 'mac123' já hasheada com bcrypt 10
-- Use este INSERT para testar login imediatamente após rodar schema.sql
-- Se já rodou o schema, execute apenas este arquivo

-- limpa seed anterior se quiser
-- DELETE FROM usuarios WHERE email='admin@mac.com';

INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Admin MAC', 'admin@mac.com', '050513')
ON CONFLICT (email) DO NOTHING;

-- ATENÇÃO: o hash acima é placeholder. Gere um hash real rodando no terminal do backend:
-- node -e "import('bcryptjs').then(async m=>console.log(await m.hash('mac123',10)))"
-- copie o resultado e faça:
-- UPDATE usuarios SET senha_hash='<hash_aqui>' WHERE email='admin@mac.com';
