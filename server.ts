import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './src/backend/app';

async function startServer() {
  const app = await createApp();
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const expressStatic = (await import('express')).default.static;
    app.use(expressStatic(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusSwap Full-Stack server running on http://0.0.0.0:${PORT}`);
    console.log(`Swagger OpenAPI Documentation available at http://0.0.0.0:${PORT}/api/docs`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
