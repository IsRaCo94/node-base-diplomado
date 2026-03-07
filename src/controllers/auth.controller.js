import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validar que envíen los datos
    if (!username || !password) {
      return res.status(400).json({ error: "Username y password son requeridos" });
    }

    // 2. Buscar si el usuario existe en PostgreSQL
    const userQuery = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(userQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const user = result.rows[0];

    // 3. Comparar la contraseña enviada con la encriptada en la base de datos
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // 4. Generar el Token JWT
    // (En un entorno real, 'mi_secreto_super_seguro' debería ir en el archivo .env)
    const secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      secret, 
      { expiresIn: '2h' } // El token expira en 2 horas
    );

    // 5. Retornar el token exactamente como pide el Swagger
    res.status(200).json({ token: token });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export default {
  login
};