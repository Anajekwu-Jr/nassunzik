import app from './app.js';

// Dev server must run on port 3000 per AI Studio runtime constraints
const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Department of Statistics Application running on http://0.0.0.0:${PORT}`);
});
