import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import mime from 'mime-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(__dirname, 'data');

function serveDataFolder(): Plugin {
  const handler = (req: any, res: any, next: () => void) => {
    const rawUrl = (req.url || '').split('?')[0];
    if (!rawUrl.startsWith('/data/')) {
      return next();
    }

    const relative = rawUrl.replace('/data/', '').replace(/^[/\\\\]+/, '');
    const filePath = path.normalize(path.join(dataRoot, relative));

    if (!filePath.startsWith(dataRoot)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const type = mime.lookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', type);
      fs.createReadStream(filePath).pipe(res);
    });
  };

  return {
    name: 'serve-data-folder',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig({
  plugins: [react(), serveDataFolder()],
  server: {
    fs: {
      // Include workspace root (default) + data folder to avoid "outside allow list" errors.
      allow: [searchForWorkspaceRoot(process.cwd()), dataRoot]
    }
  }
});
