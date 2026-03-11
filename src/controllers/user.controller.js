import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const getUsersPaginated = async (req, res) => {
  try {
    // 1. Recibimos todos los parámetros exactos que manda Swagger
    const { page = 1, limit = 10, search = '', orderby = 'id', orderDir = 'DESC', status } = req.query;
    const offset = (page - 1) * limit;

    // 2. Armamos la consulta base
    let query = `SELECT id, username, status FROM users WHERE username ILIKE $1`;
    let countQuery = `SELECT COUNT(*) FROM users WHERE username ILIKE $1`;
    const values = [`%${search}%`];

    // 3. Si Swagger manda un status (ej. active), lo agregamos al filtro
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
      countQuery += ` AND status = $${values.length}`;
    }

    // 4. Agregamos el ordenamiento y la paginación dinámica
    query += ` ORDER BY ${orderby} ${orderDir} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    const queryValues = [...values, limit, offset];

    const result = await pool.query(query, queryValues);
    const countResult = await pool.query(countQuery, values);
    
    res.status(200).json({
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      data: result.rows
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, status, password, current_timestamp as "createdAt", current_timestamp as "updatedAt"',
      [username, hashedPassword]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getUserWithTasks = async (req, res) => {
  try {
    const userId = req.params.id;
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    const tasksResult = await pool.query('SELECT name, done FROM tasks WHERE user_id = $1', [userId]);
    res.status(200).json({ username: userResult.rows[0].username, tasks: tasksResult.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// --- NUEVOS MÉTODOS CRUD ---

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, status FROM users');
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    res.status(200).json({ total: parseInt(countResult.rows[0].count), data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getUserById = async (req, res) => {
  try {
    const result = await pool.query('SELECT username, status FROM users WHERE id = $1', [req.params.id]);
    res.status(200).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [username, hashedPassword, req.params.id]);
    res.status(200).json([result.rowCount]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const patchUser = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, status, password, current_timestamp as "createdAt", current_timestamp as "updatedAt"', 
      [status, req.params.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export default {
  getUsersPaginated, createUser, getUserWithTasks, getUsers, getUserById, updateUser, patchUser, deleteUser
};