import pg from 'pg';
import env from './env.js';
import logger from '../logs/logger.js';

const { Pool } = pg;

const pool = new Pool({
  user: env.db.user,
  password: env.db.password,
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
});

pool.connect((err, client, release) => {
  if (err) {
    logger.error('Error al conectar con la base de datos PostgreSQL', err.stack);
  } else {
    logger.info('Conexión exitosa a la base de datos PostgreSQL');
    release();
  }
});

export default pool;