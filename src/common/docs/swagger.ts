import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

export const swaggerInit = async (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('Finance Bot')
    .setDescription('The Finance Bot API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.use('/docs', (req, res, next) => {
    const auth = req.headers.authorization;

    if (!auth || typeof auth !== 'string') {
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger API"');
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    const [type, credentials] = auth.split(' ');

    if (type !== 'Basic') {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }

    const [username, password] = Buffer.from(credentials, 'base64')
      .toString()
      .split(':');

    const validUsername = configService.get('SWAGGER_USER');
    const validPassword = configService.get('SWAGGER_PASSWORD');

    if (username !== validUsername || password !== validPassword) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return;
    }
    next();
  });

  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      docExpansion: 'none',
      preloadModels: false,
      tryItOutEnabled: true,
      syntaxHighlight: true,
    },
    customSiteTitle: 'Backend Finance Bot',
    customCss: '.swagger-ui .topbar { display: none }',
  });
};
