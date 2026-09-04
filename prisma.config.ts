import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '.env.development') });

if (!process.env['DATABASE_URL'] && nodeEnv === 'production') {
  throw new Error('Please provide with database url');
}

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
