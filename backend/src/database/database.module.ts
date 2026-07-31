import { Global, Module } from '@nestjs/common';
import { PostgresPoolWrapper } from './database.wrapper';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => {
        // En producción las credenciales salen de process.env.DATABASE_URL
        const url = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_lCmeJM5jPs7u@ep-late-wind-ayrskl71-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
        return new PostgresPoolWrapper(url);
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
