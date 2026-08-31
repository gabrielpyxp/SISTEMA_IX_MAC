-- Seed de usuário com senha 'mac123' já hasheada com bcrypt 10
-- Use este INSERT para testar login imediatamente após rodar schema.sql
-- Se já rodou o schema, execute apenas este arquivo

-- limpa seed anterior se quiser
-- DELETE FROM usuarios WHERE email='admin@mac.com';

INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Admin MAC', 'admin@mac.com', '$2a$10$7Yk4XbQwZx8v9e0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h7i8j9k')
ON CONFLICT (email) DO NOTHING;

-- ATENÇÃO: o hash acima é placeholder. Gere um hash real rodando no terminal do backend:
-- node -e "import('bcryptjs').then(async m=>console.log(await m.hash('mac123',10)))"
-- copie o resultado e faça:
-- UPDATE usuarios SET senha_hash='<hash_aqui>' WHERE email='admin@mac.com';
