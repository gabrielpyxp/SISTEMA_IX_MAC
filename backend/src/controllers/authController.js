import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/httpError.js';

export const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) throw new HttpError(400, 'email e senha obrigatórios');

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);
  if (!rows.length) throw new HttpError(401, 'Credenciais inválidas');

  const user = rows[0];
  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) throw new HttpError(401, 'Credenciais inválidas');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2d' });
  res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email } });
};

export const register = async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) throw new HttpError(400, 'nome, email e senha obrigatórios');
  const hash = await bcrypt.hash(senha, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome,email,senha_hash) VALUES ($1,$2,$3) RETURNING id,nome,email,created_at',
      [nome, email, hash]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'Email já cadastrado');
    throw e;
  }
};

export const me = async (req, res) => {
  const { rows } = await pool.query('SELECT id,nome,email,created_at FROM usuarios WHERE id=$1', [req.user.id]);
  res.json(rows[0]);
};
