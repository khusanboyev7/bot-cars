import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function start() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('bot-car Project')
    .setDescription('The Bot-car API description')
    .setVersion('1.0')
    .addTag(
      'Nest, access and refresh tokens, cookies, NodeMailer, Bot and othenpm install --save @nestjs/swaggerrs...',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
      in: 'Header',
    })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
    console.log(`Swagger document: http://localhost:${PORT}/api`);
  });
}
start();
