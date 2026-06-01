import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Disable global ValidationPipe to allow multipart/form-data requests
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     whitelist: false,
  //     forbidNonWhitelisted: false,
  //     skipMissingProperties: true,
  //   }),
  // );
  app.enableCors();
  app.setGlobalPrefix('api');
  
  // 添加响应拦截器，确保正确的字符编码
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  
  await app.listen(3000);
}
bootstrap();