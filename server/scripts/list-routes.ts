// scripts/list-routes.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';
dotenv.config();

interface RouteInfo {
  path: string;
  method: string;
}

async function bootstrap() {
  // 1. Create the app (no logger)
  const app = await NestFactory.create(AppModule, { logger: false });

  // 2. Set global prefix **before** init()
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 3. Initialise the HTTP server
  await app.init();

  // 4. Grab the underlying Express router (Nest 11 still uses Express by default)
  const server = app.getHttpServer();
  const router = server._events.request._router;

  const routes: RouteInfo[] = [];

  // 5. Walk the Express router stack
  router.stack
    .filter((layer: any) => layer.route)               // keep only real routes
    .forEach((layer: any) => {
      const path = layer.route.path as string;
      const method = Object.keys(layer.route.methods)[0].toUpperCase();

      // Build full path including the global prefix
      const fullPath = globalPrefix
        ? `/${globalPrefix}${path === '/' ? '' : path}`
        : path;

      routes.push({ path: fullPath, method });
    });

  // 6. Sort & print
  routes.sort((a, b) => a.path.localeCompare(b.path));

  console.log('┌───────────────────────────────────────────────────┐');
  console.log('│                 Available Routes                  │');
  console.log('└───────────────────────────────────────────────────┘');
  console.table(routes);

  // 7. Clean-up
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error while listing routes:', err);
  process.exit(1);
});