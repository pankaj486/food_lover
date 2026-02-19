
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './lib/socketServer.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO server
  const io = initSocketServer(httpServer);
  
  // Store io instance globally so it can be accessed from API routes
  global.socketIO = io;

  // Start server
  httpServer.once('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`
    ╔════════════════════════════════════════════════════╗
    ║                                                    ║
    ║   🚀 Server ready                                  ║
    ║                                                    ║
    ║   ➜ Local:    http://${hostname}:${port}${' '.repeat(Math.max(0, 18 - hostname.length - port.toString().length))} ║
    ║   ➜ Network:  http://0.0.0.0:${port}              ║
    ║                                                    ║
    ║   ✅ Socket.IO enabled                             ║
    ║   📡 WebSocket path: /api/socket                  ║
    ║                                                    ║
    ╚════════════════════════════════════════════════════╝
    `);
  });
});
