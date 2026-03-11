import pool from '../config/db.js';

const createTask = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (name, done, user_id) VALUES ($1, $2, $3) RETURNING id, name, done, user_id as "userId", current_timestamp as "createdAt", current_timestamp as "updatedAt"',
      [name, false, req.user.id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, done FROM tasks WHERE user_id = $1', [req.user.id]);
    const countResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE user_id = $1', [req.user.id]);
    res.status(200).json({ total: parseInt(countResult.rows[0].count), data: result.rows });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getTaskById = async (req, res) => {
  try {
    const result = await pool.query('SELECT name, done FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.status(200).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateTask = async (req, res) => {
  try {
    const result = await pool.query('UPDATE tasks SET name = $1 WHERE id = $2 AND user_id = $3', [req.body.name, req.params.id, req.user.id]);
    res.status(200).json([result.rowCount]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const patchTask = async (req, res) => {
  try {
    const result = await pool.query('UPDATE tasks SET done = $1 WHERE id = $2 AND user_id = $3', [req.body.done, req.params.id, req.user.id]);
    res.status(200).json([result.rowCount]);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteTask = async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.status(204).send();
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export default {
  createTask, getTasks, getTaskById, updateTask, patchTask, deleteTask
};