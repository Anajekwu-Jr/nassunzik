import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nass_portal_jwt_secret_unizik_2026_secure_key';
const TOKEN_EXPIRY = '30d';

export function authenticateUser(usernameOrEmail, password) {
  const user = db.prepare(`
    SELECT * FROM users 
    WHERE username = ? OR email = ?
  `).get(usernameOrEmail, usernameOrEmail);

  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return { success: false, message: 'Invalid username or password' };
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }
  };
}

export function authenticatePasswordOnly(password) {
  if (!password) {
    return { success: false, message: 'Password is required' };
  }

  // Get admin accounts
  const admins = db.prepare(`
    SELECT * FROM users 
    WHERE role = 'SUPER_ADMIN' OR username = 'admin'
    ORDER BY id ASC
  `).all();

  for (const admin of admins) {
    if (bcrypt.compareSync(password, admin.password_hash)) {
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          full_name: admin.full_name
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return {
        success: true,
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          full_name: admin.full_name
        }
      };
    }
  }

  return { success: false, message: 'Invalid security password' };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
