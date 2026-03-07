import pool from '../config/db.js';

const createTask = async (req, res) => {
  try {
    const { name } = req.body;

    const userId = req.user.id; 

    if (!name) {
      return res.status(400).json({ error: "El nombre de la tarea es obligatorio" });
    }

    const query = `
      INSERT INTO tasks (name, done, user_id) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const result = await pool.query(query, [name, false, userId]);

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export default {
  createTask
};