import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpResponseFilter } from './guards/http-response.filter';
import { HttpResponseInterceptor } from './interceptors/http-response.interceptor';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpResponseFilter());
  app.useGlobalInterceptors(new HttpResponseInterceptor());

  await app.listen(3000);
}
bootstrap();
