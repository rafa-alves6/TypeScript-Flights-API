import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight API',
      version: '1.0.0',
      description: 'Documentação da API de Voos',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes.ts'], 
};

export default swaggerOptions;
