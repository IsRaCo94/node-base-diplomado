import pg from 'pg';

const connectionString = 'postgresql://db_diplomado_cbj9_user:6nxv2UIp4I8Z6XgFoSE5v4p7pj3JHuhI@dpg-d6lsr8khg0os73av9r6g-a.oregon-postgres.render.com/db_diplomado_cbj9';

const pool = new pg.Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function crearTablas() {
  console.log("⏳ Conectando a la base de datos de Render...");
  try {
    await pool.query(`
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'active'
      );

      CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          done BOOLEAN DEFAULT false,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("✅ ¡Misión cumplida! Las tablas users y tasks fueron creadas en la nube.");
  } catch (error) {
    console.error("❌ Error al crear tablas:", error.message);
  } finally {
    await pool.end();
  }
}

crearTablas();