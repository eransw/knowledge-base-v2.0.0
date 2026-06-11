import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 注册全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  
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
  
  // 增加请求体大小限制，支持大文件上传
  app.use((req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  
  // 设置 Express 的请求体大小限制
  const express = require('express');
  app.use(express.json({ limit: '500mb' }));
  app.use(express.urlencoded({ limit: '500mb', extended: true }));
  
  await app.listen(3000);
}
bootstrap();