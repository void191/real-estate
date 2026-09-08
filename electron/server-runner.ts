import { createServer, Server as HttpServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { initSocketServer } from '../lib/socket-server';

export interface RunningServer {
  httpServer: HttpServer;
  io: SocketIOServer;
  port: number;
  stop: () => Promise<void>;
}

export async function startAppServer(
  preferredPort = 3000,
  dev = false,
  projectDir = process.cwd()
): Promise<RunningServer> {
  const hostname = '127.0.0.1';

  const app = next({
    dev,
    hostname,
    port: preferredPort,
    dir: projectDir,
  });

  await app.prepare();
  const handle = app.getRequestHandler();

  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request in embedded server:', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  initSocketServer(io);

  // Attempt to listen on preferred port, or increment if busy
  const actualPort = await new Promise<number>((resolve, reject) => {
    let portToTry = preferredPort;

    const tryListen = () => {
      httpServer.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${portToTry} is in use, trying ${portToTry + 1}...`);
          portToTry++;
          setTimeout(tryListen, 100);
        } else {
          reject(err);
        }
      });

      httpServer.listen(portToTry, hostname, () => {
        console.log(`> Embedded Next.js server ready on http://${hostname}:${portToTry}`);
        console.log(`> Embedded Socket.io initialized.`);
        resolve(portToTry);
      });
    };

    tryListen();
  });

  return {
    httpServer,
    io,
    port: actualPort,
    stop: () =>
      new Promise<void>((resolve) => {
        io.close();
        httpServer.close(() => {
          console.log('> Embedded server terminated gracefully.');
          resolve();
        });
      }),
  };
}
