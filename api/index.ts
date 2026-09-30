// Entry point Vercel Serverless Function: export Express app, KHÔNG gọi app.listen().
// vercel.json rewrite mọi request /api/* về function này; Express nhận nguyên path gốc.
import { createApp } from '../server/app.js';

const app = createApp();

export default app;
