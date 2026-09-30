// Dev server local (không dùng trên Vercel — Vercel dùng api/index.ts)
import 'dotenv/config';
import { createApp } from './app.js';
import { getAppConfig } from './config/env.js';

const { port } = getAppConfig();

createApp().listen(port, () => {
  console.log(`API đang chạy: http://localhost:${port}/api (health: /api/health)`);
});
