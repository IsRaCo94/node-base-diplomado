import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// 1. Función de prueba
const getPrueba = (req, res) => {
  res.send('hola');
};

// 2. Función de Paginación (Los 30 puntos)
const getUsersPaginated = async (req, res) => {
  try {
    let { 
        page = 1, 
        limit = 10, 
        search = '', 
        orderby = 'id', 
        orderDir = 'DESC',
        status = 'active'
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const validColumns = ['id', 'username', 'status'];
    if (!validColumns.includes(orderby)) orderby = 'id';
    orderDir = orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let whereClauses = [];
    let queryParams = [];

    if (status) {
        queryParams.push(status);
        whereClauses.push(`status = $${queryParams.length}`);
    }

    if (search) {
        queryParams.push(`%${search}%`);
        whereClauses.push(`username ILIKE $${queryParams.length}`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) FROM users ${whereString}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Obtener datos paginados
    queryParams.push(limit, offset);
    const dataQuery = `
        SELECT id, username, status 
        FROM users 
        ${whereString} 
        ORDER BY ${orderby} ${orderDir} 
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;
    const dataResult = await pool.query(dataQuery, queryParams);
    const pages = Math.ceil(total / limit);

    // Retornar la respuesta exacta que pide Swagger
    res.status(200).json({
        total: total,
        page: page,
        pages: pages,
        data: dataResult.rows
    });

  } catch (error) {
    console.error("Error en paginación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({ error: "El username y el password son obligatorios" });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar en la base de datos y devolver el usuario creado
    const query = `
      INSERT INTO users (username, password) 
      VALUES ($1, $2) 
      RETURNING id, username, status, password
    `;
    const result = await pool.query(query, [username, hashedPassword]);

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Error al crear usuario:", error);
    if (error.code === '23505') {
        return res.status(400).json({ error: "Ese username ya está en uso" });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getUserWithTasks = async (req, res) => {
  try {
    const userId = req.params.id;


    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

  
    const tasksResult = await pool.query('SELECT name, done FROM tasks WHERE user_id = $1', [userId]);


    res.status(200).json({
      username: userResult.rows[0].username,
      tasks: tasksResult.rows
    });

  } catch (error) {
    console.error("Error al obtener usuario y tareas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export default {
  getPrueba,
  getUsersPaginated,
  createUser,
  getUserWithTasks 
};