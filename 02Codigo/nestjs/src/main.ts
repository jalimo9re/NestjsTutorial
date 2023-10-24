import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log(process.env.API_URL);
  console.log(process.env.API_PORT);
  console.log(process.env.VOLUME_FOLDER);
  console.log(process.env.POSTGRES_USER);
  console.log(process.env.POSTGRES_PASSWORD);
  console.log(process.env.POSTGRES_DB);
  console.log(process.env.DATABASE_URL);
  
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.API_PORT);
}
bootstrap();
