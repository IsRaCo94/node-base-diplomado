import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: "No se proporcionó un token válido" });
  }

  const token = authHeader.split(' ')[1];

  try {

    const secret = process.env.JWT_SECRET || 'mi_secreto_super_seguro';
    const decoded = jwt.verify(token, secret);
    
  
    req.user = decoded; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: "Token no válido o expirado" });
  }
};