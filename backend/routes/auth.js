import express from 'express';
import { authenticateUser, authenticatePasswordOnly } from '../auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required to access the admin portal' });
  }

  let result;
  if (username) {
    result = authenticateUser(username, password);
  } else {
    result = authenticatePasswordOnly(password);
  }

  if (!result.success) {
    return res.status(401).json({ error: result.message });
  }

  res.json({
    token: result.token,
    user: result.user
  });
});

router.get('/me', requireAuth(), (req, res) => {
  res.json({ user: req.user });
});

export default router;
